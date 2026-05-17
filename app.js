const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const net2plus = require('./net2plus');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const AUTH_PASSWORD = '88874';
const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

const RANK_NAMES = {
    1: "青铜",
    2: "白银",
    3: "黄金",
    4: "铂金",
    5: "钻石",
    6: "星耀",
    7: "王者"
};

const FRAME_STATUS = {
    1: "百强",
    2: "十强",
    3: "最强"
};

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function parseCookies(req) {
    const cookie = req.headers.cookie;
    req.cookies = {};
    if (cookie) {
        cookie.split(';').forEach(item => {
            const parts = item.split('=');
            if (parts.length === 2) {
                req.cookies[parts[0].trim()] = parts[1].trim();
            }
        });
    }
}

function checkAuth(req, res, next) {
    parseCookies(req);
    if (req.path === '/login' || req.cookies[COOKIE_NAME]) {
        return next();
    }
    return res.redirect('/login');
}

app.use((req, res, next) => {
    parseCookies(req);
    next();
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/api/login', (req, res) => {
    const password = req.body.password;
    if (password === AUTH_PASSWORD) {
        const token = generateToken();
        return res.json({ success: true, token });
    } else {
        return res.json({ success: false, error: '密码错误，请重试' });
    }
});

app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.get('/', checkAuth, (req, res) => {
    res.render('index');
});

app.get('/user/:bczid', checkAuth, async (req, res) => {
    const bczid = req.params.bczid;
    try {
        const userDetails = await net2plus.getPersonalDetails(bczid);

        if (userDetails.error) {
            return res.render('error', { error: userDetails.error });
        }

        if (!userDetails.data) {
            return res.render('error', { error: userDetails.message || '你搜索的ID不存在' });
        }

        const userData = userDetails.data;

        const ownGroups = await net2plus.getOwnGroups(bczid);
        const authorizedGroups = await net2plus.getGroupAuthorizationPage(bczid);

        const groups = [];

        if (ownGroups.data && ownGroups.data.list) {
            for (const group of ownGroups.data.list) {
                if (group.leader) {
                    group.relationship = '班长';
                } else {
                    group.relationship = '成员';
                }
                groups.push(group);
            }
        }

        const groupDetailsList = [];
        for (const group of groups) {
            const groupDetail = { ...group };

            if (groupDetail.avatar && !groupDetail.avatar.startsWith('http')) {
                groupDetail.avatar = `https://vol-v6.bczcdn.com${groupDetail.avatar}`;
            }

            const finishingRate = groupDetail.finishingRate || 0;
            groupDetail.completion_rate = `${(finishingRate * 100).toFixed(1)}%`;

            groupDetail.totalCount = groupDetail.memberCount || 0;
            groupDetail.max_members = groupDetail.countLimit || 20;

            groupDetail.checkCount = groupDetail.todayDakaCount || 0;

            const rank = groupDetail.rank || 1;
            groupDetail.rank_name = RANK_NAMES[rank] || "青铜";

            const shareKey = groupDetail.shareKey;
            if (shareKey) {
                const groupInfo = await net2plus.getGroupInformation(shareKey);
                if (groupInfo.data && groupInfo.data.members) {
                    for (const member of groupInfo.data.members) {
                        if (member.leader) {
                            const leaderUniqueId = member.uniqueId || '';
                            groupDetail.leaderUniqueId = leaderUniqueId;
                            groupDetail.leaderAvatar = member.avatar || '';

                            const leaderDetails = await net2plus.getPersonalDetails(leaderUniqueId);
                            if (leaderDetails.data) {
                                groupDetail.leaderName = leaderDetails.data.name || member.nickname || '';
                            } else {
                                groupDetail.leaderName = member.nickname || '';
                            }
                        }

                        if (member.uniqueId === userData.uniqueId) {
                            groupDetail.user_duration_days = member.durationDays || 0;
                            groupDetail.user_completed_times = member.completedTimes || 0;
                        }
                    }

                    if (groupDetail.user_duration_days === undefined) {
                        groupDetail.user_duration_days = 0;
                        groupDetail.user_completed_times = 0;
                    }
                }
            }

            if (!groupDetail.leaderName) {
                groupDetail.leaderName = userData.name || '';
                groupDetail.leaderAvatar = userData.avatar || '';
                groupDetail.leaderUniqueId = userData.uniqueId || '';
            }

            let frameStatus = 0;
            if (groupDetail.avatarFrame) {
                frameStatus = 1;
            }
            groupDetail.frame_status_text = FRAME_STATUS[frameStatus] || "";

            groupDetailsList.push(groupDetail);
        }

        saveApiTestInfo(`user_${bczid}_details.json`, userDetails);
        saveApiTestInfo(`user_${bczid}_groups.json`, { own_groups: ownGroups, authorized_groups: authorizedGroups });

        res.render('user_info', {
            user: userData,
            groups: groupDetailsList
        });

    } catch (e) {
        res.render('error', { error: e.message });
    }
});

function saveApiTestInfo(filename, data) {
    const dataDir = path.join(__dirname, "data_of_re");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
}

if (require.main === module) {
    const PORT = 1254;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

const axios = require('axios');
const crypto = require('crypto');

const token = "KPM5Jan7FZBUSsfOTJw%2BV5kn5VtnUVS6KF1dCcxgjrA%3D";

const HOME_PAGE_URL = "https://social.baicizhan.com/api/deskmate/home_page";
const PERSONAL_INFOS_URL = "https://passport.baicizhan.com/api/unified_user_service/personal_infos";
const PERSONAL_DETAILS_URL = "https://social.baicizhan.com/api/deskmate/personal_details";
const OWN_GROUPS_URL = "https://group.baicizhan.com/group/own_groups";
const GROUP_AUTHORIZATION_URL = "https://group.baicizhan.com/group/get_group_authorization_page";
const GROUP_RANK_URL = "https://group.baicizhan.com/group/get_group_rank";
const GROUP_INFORMATION_URL = "https://group.baicizhan.com/group/information";
const WEEK_RANK_URL = "https://group.baicizhan.com/group/get_week_rank";
const GROUP_NOTICE_URL = "https://group.baicizhan.com/group/notice";
const GROUP_LEADER_RANK_URL = "https://group.baicizhan.com/group/get_group_leader_rank";
const FRIEND_STATE_URL = "https://social.baicizhan.com/api/social/get_friend_state";
const CREDIT_VO_URL = "https://learn.baicizhan.com/api/mall/proxy/creditmall/get_credit_vo";
const CREDIT_RECORDS_URL = "https://learn.baicizhan.com/api/mall/proxy/creditmall/get_credit_records";

function getHeaders(tok = token) {
    const md5 = crypto.createHash('md5');
    md5.update(tok);
    const deviceId = md5.digest('hex').slice(0, 8).toUpperCase();

    const defaultHeaders = {
        "Connection": "keep-alive",
        "User-Agent": "bcz_app_android/7060100 android_version/12 device_name/DCO-AL00 - HUAWEI",
        "Accept": "*/*",
        "Origin": "",
        "X-Requested-With": "",
        "Sec-Fetch-Site": "same-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
    };

    const defaultCookie = {
        "access_token": tok,
        "client_time": String(Math.floor(Date.now() / 1000)),
        "app_name": "7060100",
        "bcz_dmid": deviceId.toLowerCase(),
        "channel": "qq",
        "device_id": deviceId + "E" + deviceId,
        "device_name": "android/DCO-AL00-HUAWEI",
        "device_version": "12",
        "Pay-Support-H5": "alipay_mob_client"
    };

    const cookieStr = Object.entries(defaultCookie).map(([key, value]) => `${key}=${value}`).join("; ");
    defaultHeaders["Cookie"] = cookieStr;

    return defaultHeaders;
}

async function getPersonalDetails(uniqueId) {
    const url = `${PERSONAL_DETAILS_URL}?uniqueId=${uniqueId}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get personal details, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_personal_details: ${e.message}` };
        }
        return { error: `Unexpected error in get_personal_details: ${e.message}` };
    }
}

async function getOwnGroups(uniqueId) {
    const url = `${OWN_GROUPS_URL}?uniqueId=${uniqueId}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get own groups, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_own_groups: ${e.message}` };
        }
        return { error: `Unexpected error in get_own_groups: ${e.message}` };
    }
}

async function getGroupAuthorizationPage(uniqueId) {
    const url = `${GROUP_AUTHORIZATION_URL}?uniqueId=${uniqueId}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get group authorization page, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_group_authorization_page: ${e.message}` };
        }
        return { error: `Unexpected error in get_group_authorization_page: ${e.message}` };
    }
}

async function getGroupRank(week, shareKey) {
    const url = `https://group.baicizhan.com/group/get_week_rank?shareKey=${shareKey}&week=${week}`;
    const headers = token ? getHeaders(token) : {};
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (e) {
        return { error: `Request exception in get_group_rank: ${e.message}` };
    }
}

async function getGroupInformation(shareKey) {
    const url = `${GROUP_INFORMATION_URL}?shareKey=${shareKey}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get group information, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_group_information: ${e.message}` };
        }
        return { error: `Unexpected error in get_group_information: ${e.message}` };
    }
}

async function getWeekRank(shareKey, week) {
    const url = `${WEEK_RANK_URL}?shareKey=${shareKey}&week=${week}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get week rank, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_week_rank: ${e.message}` };
        }
        return { error: `Unexpected error in get_week_rank: ${e.message}` };
    }
}

async function getGroupNotice(shareKey) {
    const url = `${GROUP_NOTICE_URL}?shareKey=${shareKey}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get group notice, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_group_notice: ${e.message}` };
        }
        return { error: `Unexpected error in get_group_notice: ${e.message}` };
    }
}

async function getFriendState(uniqueId) {
    const url = `${FRIEND_STATE_URL}?uniqueId=${uniqueId}`;
    const headers = getHeaders();
    try {
        const response = await axios.get(url, { headers, timeout: 10000 });
        if (response.status === 200) {
            return response.data;
        } else {
            return { error: `Failed to get friend state, status code: ${response.status}`, status_code: response.status };
        }
    } catch (e) {
        if (e.response) {
            return { error: `Request exception in get_friend_state: ${e.message}` };
        }
        return { error: `Unexpected error in get_friend_state: ${e.message}` };
    }
}

module.exports = {
    getPersonalDetails,
    getOwnGroups,
    getGroupAuthorizationPage,
    getGroupRank,
    getGroupInformation,
    getWeekRank,
    getGroupNotice,
    getFriendState
};

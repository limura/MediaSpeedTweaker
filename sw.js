function GetTweetDateFromTweetUrl(tweetUrl){
    //https://twitter.com/kemohure/status/1513126508508123137
    const tweetIdMatched = tweetUrl.match(/\/status\/(\d+)/);
    if(!tweetIdMatched){return;}
    const tweetId = tweetIdMatched[1];
    console.log("tweetId:", tweetId, tweetUrl);
    const tweetIdNum = BigInt(tweetId);
    const tweetMillisecond = tweetIdNum >> 22n;
    const twitterEpocTime = new Date();
    twitterEpocTime.setUTCFullYear(2010);
    twitterEpocTime.setUTCMonth(11-1);
    twitterEpocTime.setUTCDate(4);
    twitterEpocTime.setUTCHours(1);
    twitterEpocTime.setUTCMinutes(42);
    twitterEpocTime.setUTCSeconds(54.657);
    twitterEpocMillisecond = twitterEpocTime.getTime();
    const targetDate = new Date(Number(tweetMillisecond) + twitterEpocMillisecond);
    return targetDate;
}

function DateToFormatedString(date){
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${(date.getUTCDate()).toString().padStart(2, '0')}_${(date.getUTCHours()).toString().padStart(2, '0')}:${(date.getUTCMinutes()).toString().padStart(2, '0')}:${Math.round(date.getUTCMilliseconds() / 1000).toString().padStart(2, '0')}_UTC`;
}

function GenerateSearchUrl(userId, targetDate, sinceMillisecond, untilMillisecond){
    const sinceDate = new Date(targetDate.getTime() + sinceMillisecond);
    const untilDate = new Date(targetDate.getTime() + untilMillisecond);
    const sinceDateFormated = DateToFormatedString(sinceDate);
    const untilDateFormated = DateToFormatedString(untilDate);
    return `https://twitter.com/search?q=from:${userId} since:${sinceDateFormated} until:${untilDateFormated}`;
}

function GetTweetUserID(tweetUrl){
    //https://twitter.com/kemohure/status/1513126508508123137
    const tweetIdMatched = tweetUrl.match(/\/([^/]+)\/status\//);
    if(!tweetIdMatched){return;}
    const userId = tweetIdMatched[1];
    return userId;
}

function GetSearchUrl(tweetUrl){
    const targetDate = GetTweetDateFromTweetUrl(tweetUrl);
    const userId = GetTweetUserID(tweetUrl);
    return GenerateSearchUrl(userId, targetDate, -60*60*1000, 60*60*1000);
}

chrome.contextMenus.onClicked.addListener((info,tab) => {
  console.log("contextMenus.onClicked:", info, tab);
  console.log(GetSearchUrl(info.linkUrl));
});

chrome.contextMenus.create({
  id: "RightClickMenu01",
  title: "このTweetの前後を検索する",
  contexts: ["link"],
  targetUrlPatterns: ["https://twitter.com/*/status/*"],
  type: "normal"
}, () => {console.log("contextMenus event?");});



/*

Twitter のそのTweetを表示した時にこういう <script> がある。
<script type="text/javascript" charset="utf-8" nonce="Mzg5MTNjZjYtY2UxNi00NGI0LTljNDMtMGViM2U0NmM3ZTEw" crossorigin="anonymous" src="https://abs.twimg.com/responsive-web/client-web/main.dabbf166.js">



その https://abs.twimg.com/responsive-web/client-web/main.dabbf166.js の中に

function(e,t){e.exports={queryId:"iJQTYIiRaohHJH-hIBIpTw",operationName:"Retweeters",operationType:"query",metadata:{featureSwitches:{__fs_responsive_web_like_by_author_enabled:"responsive_web_like_by_author_enabled",__fs_dont_mention_me_view_api_enabled:"dont_mention_me_view_api_enabled",__fs_interactive_text_enabled:"interactive_text_enabled",__fs_responsive_web_uc_gql_enabled:"responsive_web_uc_gql_enabled",__fs_responsive_web_edit_tweet_api_enabled:"responsive_web_edit_tweet_api_enabled"}}}}

という部分を含むクソ長い行があって、その中の「iJQTYIiRaohHJH-hIBIpTw」を使うと以下のリクエストを投げ込めるハズ。


リツートした人のリストを取得するやつ
https://twitter.com/i/api/graphql/iJQTYIiRaohHJH-hIBIpTw/Retweeters?variables=%7B%22tweetId%22%3A%221515248816236425220%22%2C%22count%22%3A40%2C%22cursor%22%3A%22HCaAgICdnIGwgzAAAA%3D%3D%22%2C%22includePromotedContent%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%2C%22withDownvotePerspective%22%3Afalse%2C%22withReactionsMetadata%22%3Afalse%2C%22withReactionsPerspective%22%3Afalse%2C%22withSuperFollowsTweetFields%22%3Atrue%2C%22__fs_responsive_web_like_by_author_enabled%22%3Afalse%2C%22__fs_dont_mention_me_view_api_enabled%22%3Atrue%2C%22__fs_interactive_text_enabled%22%3Atrue%2C%22__fs_responsive_web_uc_gql_enabled%22%3Afalse%2C%22__fs_responsive_web_edit_tweet_api_enabled%22%3Afalse%7D

curl:

curl "https://twitter.com/i/api/graphql/iJQTYIiRaohHJH-hIBIpTw/Retweeters?variables=^%^7B^%^22tweetId^%^22^%^3A^%^221515248816236425220^%^22^%^2C^%^22count^%^22^%^3A20^%^2C^%^22includePromotedContent^%^22^%^3Atrue^%^2C^%^22withSuperFollowsUserFields^%^22^%^3Atrue^%^2C^%^22withDownvotePerspective^%^22^%^3Afalse^%^2C^%^22withReactionsMetadata^%^22^%^3Afalse^%^2C^%^22withReactionsPerspective^%^22^%^3Afalse^%^2C^%^22withSuperFollowsTweetFields^%^22^%^3Atrue^%^2C^%^22__fs_responsive_web_like_by_author_enabled^%^22^%^3Afalse^%^2C^%^22__fs_dont_mention_me_view_api_enabled^%^22^%^3Atrue^%^2C^%^22__fs_interactive_text_enabled^%^22^%^3Atrue^%^2C^%^22__fs_responsive_web_uc_gql_enabled^%^22^%^3Afalse^%^2C^%^22__fs_responsive_web_edit_tweet_api_enabled^%^22^%^3Afalse^%^7D" ^
  -H "authority: twitter.com" ^
  -H "accept: */*" ^
  -H "accept-language: ja,en;q=0.9,en-US;q=0.8" ^
  -H "authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs^%^3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA" ^
  -H "content-type: application/json" ^
  -H "cookie: guest_id_marketing=v1^%^3A164144294800671395; guest_id_ads=v1^%^3A164144294800671395; personalization_id=^\^"v1_3ZnW+xlQ6YVAB29uHh1zVA==^\^"; guest_id=v1^%^3A164144294800671395; kdt=iM8JKsYqX39oiqykItqvjgEybbHy3tmsy46tcLTx; auth_token=a8aac1eedeff4837f1c055ea1932f0767c4f767d; ct0=c1925c9e1b92776de18b163f46c15aa735d686dbbeeb172640e0b25f527df2d54e940810cac3de06497c1e185839eaabda417329bea98556dd0774dbe5db5cad80eb62ad561e3049c3db7a6adf011bf3; twid=u^%^3D6173732; lang=ja; _ga=GA1.2.937981948.1643866981; at_check=true; _twitter_sess=BAh7CyIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo^%^250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCIm2ny1^%^252BAToMY3NyZl9p^%^250AZCIlMWFjNjk4NzYyOThiODc0NjE1NjFmYmM5YmZjNjIzMzk6B2lkIiVlMTE2^%^250AZTE4MmU0ZTZiZWJmMDVlNGViMWE0NzFkYmY0ZDofbGFzdF9wYXNzd29yZF9j^%^250Ab25maXJtYXRpb24iFTE2NDU3ODY1NzQzNDEwMDA6HnBhc3N3b3JkX2NvbmZp^%^250Acm1hdGlvbl91aWQiDDYxNzM3MzI^%^253D--4627d3c7a39383c114d5683aa4ce7206f1261a79; mbox=PC^#de2854255db34d1d89ffccc099303e87.32_0^#1713075193^|session^#f0717752fd09496c88b4c39a9c62e471^#1649832253; external_referer=padhuUp37zhJObO73CqsXZ0^%^2BLgQ^%^2Btq8mzPyoRg8vB3o^%^3D^|0^|8e8t2xd8A2w^%^3D" ^
  -H "dnt: 1" ^
  -H "referer: https://twitter.com/v_avenger/status/1515248816236425220/retweets" ^
  -H "sec-ch-ua: ^\^" Not A;Brand^\^";v=^\^"99^\^", ^\^"Chromium^\^";v=^\^"100^\^", ^\^"Google Chrome^\^";v=^\^"100^\^"" ^
  -H "sec-ch-ua-mobile: ?0" ^
  -H "sec-ch-ua-platform: ^\^"Windows^\^"" ^
  -H "sec-fetch-dest: empty" ^
  -H "sec-fetch-mode: cors" ^
  -H "sec-fetch-site: same-origin" ^
  -H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36" ^
  -H "x-csrf-token: c1925c9e1b92776de18b163f46c15aa735d686dbbeeb172640e0b25f527df2d54e940810cac3de06497c1e185839eaabda417329bea98556dd0774dbe5db5cad80eb62ad561e3049c3db7a6adf011bf3" ^
  -H "x-twitter-active-user: yes" ^
  -H "x-twitter-auth-type: OAuth2Session" ^
  -H "x-twitter-client-language: ja" ^
  --compressed

ペイロード

{"tweetId":"1515248816236425220","count":40,"cursor":"HCaAgICdnIGwgzAAAA==","includePromotedContent":true,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"__fs_responsive_web_like_by_author_enabled":false,"__fs_dont_mention_me_view_api_enabled":true,"__fs_interactive_text_enabled":true,"__fs_responsive_web_uc_gql_enabled":false,"__fs_responsive_web_edit_tweet_api_enabled":false}

レスポンス(抜粋。一人分？)

{
    "data": {
        "retweeters_timeline": {
            "timeline": {
                "instructions": [
                    {
                        "type": "TimelineAddEntries",
                        "entries": [
                            {
                                "entryId": "user-1394997763192983559",
                                "sortIndex": "1730333569631387648",
                                "content": {
                                    "entryType": "TimelineTimelineItem",
                                    "itemContent": {
                                        "itemType": "TimelineUser",
                                        "user_results": {
                                            "result": {
                                                "__typename": "User",
                                                "id": "VXNlcjoxMzk0OTk3NzYzMTkyOTgzNTU5",
                                                "rest_id": "1394997763192983559",
                                                "affiliates_highlighted_label": {},
                                                "has_nft_avatar": false,
                                                "legacy": {
                                                    "blocked_by": false,
                                                    "blocking": false,
                                                    "can_dm": true,
                                                    "can_media_tag": false,
                                                    "created_at": "Wed May 19 12:46:20 +0000 2021",
                                                    "default_profile": true,
                                                    "default_profile_image": false,
                                                    "description": "組み込み系エンジニアです。（ハードウェア時々ソフトウェア）\nI'm an embedded engineer. (Hardware)\n\nFrequently used Programming Language: BASIC3→ひまわり→VB 6.0→8bit PIC Assembly→8bit PIC C (XC8)",
                                                    "entities": {
                                                        "description": {
                                                            "urls": []
                                                        },
                                                        "url": {
                                                            "urls": [
                                                                {
                                                                    "display_url": "riss.ipa.go.jp/r?r=000117",
                                                                    "expanded_url": "https://riss.ipa.go.jp/r?r=000117",
                                                                    "url": "https://t.co/nQIqDPgf5x",
                                                                    "indices": [
                                                                        0,
                                                                        23
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    "fast_followers_count": 0,
                                                    "favourites_count": 129,
                                                    "follow_request_sent": false,
                                                    "followed_by": false,
                                                    "followers_count": 157,
                                                    "following": false,
                                                    "friends_count": 608,
                                                    "has_custom_timelines": false,
                                                    "is_translator": false,
                                                    "listed_count": 4,
                                                    "location": "Chiba, JAPAN",
                                                    "media_count": 6,
                                                    "muting": false,
                                                    "name": "Y.Yamashiro＠準学士(工学)/情報処理安全確保支援士(第000117号)",
                                                    "normal_followers_count": 157,
                                                    "notifications": false,
                                                    "pinned_tweet_ids_str": [
                                                        "1511548207863455750"
                                                    ],
                                                    "profile_banner_extensions": {
                                                        "mediaColor": {
                                                            "r": {
                                                                "ok": {
                                                                    "palette": [
                                                                        {
                                                                            "percentage": 44.68,
                                                                            "rgb": {
                                                                                "blue": 29,
                                                                                "green": 27,
                                                                                "red": 29
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 24.78,
                                                                            "rgb": {
                                                                                "blue": 199,
                                                                                "green": 198,
                                                                                "red": 200
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 15.77,
                                                                            "rgb": {
                                                                                "blue": 135,
                                                                                "green": 101,
                                                                                "red": 20
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 2.29,
                                                                            "rgb": {
                                                                                "blue": 32,
                                                                                "green": 58,
                                                                                "red": 84
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 0.87,
                                                                            "rgb": {
                                                                                "blue": 9,
                                                                                "green": 19,
                                                                                "red": 46
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "profile_banner_url": "https://pbs.twimg.com/profile_banners/1394997763192983559/1621429327",
                                                    "profile_image_extensions": {
                                                        "mediaColor": {
                                                            "r": {
                                                                "ok": {
                                                                    "palette": [
                                                                        {
                                                                            "percentage": 32.08,
                                                                            "rgb": {
                                                                                "blue": 89,
                                                                                "green": 135,
                                                                                "red": 161
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 31.09,
                                                                            "rgb": {
                                                                                "blue": 29,
                                                                                "green": 42,
                                                                                "red": 49
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 13.9,
                                                                            "rgb": {
                                                                                "blue": 22,
                                                                                "green": 75,
                                                                                "red": 139
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 5.93,
                                                                            "rgb": {
                                                                                "blue": 253,
                                                                                "green": 255,
                                                                                "red": 255
                                                                            }
                                                                        },
                                                                        {
                                                                            "percentage": 4.41,
                                                                            "rgb": {
                                                                                "blue": 151,
                                                                                "green": 206,
                                                                                "red": 234
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "profile_image_url_https": "https://pbs.twimg.com/profile_images/1460932345478139905/QXl34SE7_normal.jpg",
                                                    "profile_interstitial_type": "",
                                                    "protected": false,
                                                    "screen_name": "riss000117",
                                                    "statuses_count": 112,
                                                    "translator_type": "none",
                                                    "url": "https://t.co/nQIqDPgf5x",
                                                    "verified": false,
                                                    "want_retweets": false,
                                                    "withheld_in_countries": []
                                                },
                                                "professional": {
                                                    "rest_id": "1460929980763086849",
                                                    "professional_type": "Creator",
                                                    "category": [
                                                        {
                                                            "id": 713,
                                                            "name": "科学・テクノロジー"
                                                        }
                                                    ]
                                                },
                                                "super_follow_eligible": false,
                                                "super_followed_by": false,
                                                "super_following": false
                                            }
                                        },
                                        "userDisplayType": "User"
                                    }
                                }
                            },
                            {
                                "entryId": "cursor-top-1730333569631387649",
                                "sortIndex": "1730333569631387649",
                                "content": {
                                    "entryType": "TimelineTimelineCursor",
                                    "value": "HCaAgICN2M2wgzAAAA==",
                                    "cursorType": "Top"
                                }
                            },
                            {
                                "entryId": "cursor-bottom-1730310733868040191",
                                "sortIndex": "1730310733868040191",
                                "content": {
                                    "entryType": "TimelineTimelineCursor",
                                    "value": "HBaAgIC0vJymgzAAAA==",
                                    "cursorType": "Bottom",
                                    "stopOnEmptyResponse": true
                                }
                            }
                        ]
                    }
                ],
                "responseObjects": {
                    "feedbackActions": [],
                    "immediateReactions": []
                }
            }
        }
    }
}


//div[@id='content' and not(child::ul//li/a[contains(@href,'/page/')])]//div[@id='page_link']//li[@class='next']/a[contains(@href,'/page/')]|//section[not(child::h2[contains(text(),'目次')])]/ul[@class='menu']/li/a[contains(@href,'/page/') and contains(text(),'次:')]

//div[@id='content']/p/a[contains(@href,'/page/') and position()=last()]|//section[not(child::h2[contains(text(),'目次')])]/ul[@class='menu']/li[position()=1]/a[contains(@href,'/page/')]

このサイトは似たようなURLで小説本文と本文へのリンクが記述されている場合があり、さらに、本文へのリンクのページへのリンクが記述されたページがあり、さらにその上のリンクのページへのリンクのページなどもあって、かなりややこしいです。また、個々のページのDOM構造が統一されていないようで、少なくとも二種類のDOM構造を確認しています。具体的には、 https://nijikana.net/index.php/page/kamishiro_other_osaka01 のDOM構造と https://nijikana.net/index.php/page/kamishiro_other_18_01 のDOM構造は違っていて、片方は //div[@class='novel_view'] はあるけれど、もう片方にはありません。また、このサイトはスマートフォン等へのDOM構造ももっているため、それへの対応も必要になります。

*/

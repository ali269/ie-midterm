// gets user basic information in json fromat from github api
async function getUser(userID) {
    var url = "https://api.github.com/users/" + userID;
    return fetch(url)
        .then(res => res.json())
        .then(value => value)
        .catch(err => {
            throw new Error("username not found")
        })
}

// tests for 5 recent pushed repos and returns most scored language
async function getPL(userID) {
    var url = "https://api.github.com/users/" + userID + "/repos";
    var reps = await fetch(url).then(res => res.json());
    var sorted = reps.sort(((p1, p2) => {
        if (p1.pushed_at < p2.pushed_at) {
            return 1;
        }
        else {
            return -1;
        }
    }));
    var selected = sorted.slice(0, 5);
    console.log(selected);
    var languages = {};
    var maxi = -1;
    var langm;
    for (var value in selected) {
        console.log(selected[value].name + " > " + selected[value].pushed_at)
        var langs = await fetch(selected[value].url+ "/languages").then(res => res.json())
        for (var lang in langs) {
            languages[lang] = languages[lang] + langs[lang] || langs[lang];
        }
    }
    console.log(languages)
    for (var lang in languages) {
        if (languages[lang] > maxi) {
            langm = lang;
            maxi = languages[lang];
        }
    }
    return langm;
}

// fulfills user bio part
var createBio = (text) => {
    var element = document.getElementById('bio-text');
    if (text != undefined && text != "") {
        element.innerHTML = text;
    } else {
        element.innerHTML = 'empty'
    }
}

// fulfills user different infos
var fillElement = (elementId, value) => {
    var element = document.getElementById(elementId);
    if (value != undefined && value != "") {
        element.innerHTML = value;
        if (elementId==='user-blog') {
            element.href = value;
        }
    } else {
        element.innerHTML = ''
    }
}

// sets profile image url
var setImage = (elementId, value) => {
    var element = document.getElementById(elementId);
    element.src = value;
}

function clearElement(id) {
    var elem = document.getElementById(id);
    elem.innerHTML = '';
}

//clears user profile
function clearProfile() {
    setImage('user-img', "./media/examples/avatar.png");
    clearElement('user-name');
    clearElement('user-blog');
    clearElement('user-city');
    clearElement('bio-text');
    clearElement('user-lang');
}

// user click handler
var clickHandler = () => {
    clearProfile();
    var userID = String(document.getElementById('user-id').value).trim();
    var user = localStorage.getItem(userID);
    if (user != undefined) {
        var errElement = document.getElementById('error-element');
        errElement.hidden = true;
        user = JSON.parse(user);
        setImage('user-img', user['img_url']);
        fillElement('user-name', user.name);
        fillElement('user-blog', user.blog)
        fillElement('user-city', user.city);
        console.log(user.blog);
        createBio(user.bio);
        fillElement('user-lang', user.language);
        console.log('got from local storage');
    }
    else {
        var userinfo = {}
        getUser(userID)
        .then(res => {
            var errElement = document.getElementById('error-element');
            errElement.hidden = true;
            console.log(res)
            if(res.message === "Not Found") {
                throw new Error('user not found');
            }
            setImage('user-img', res.avatar_url);
            fillElement('user-name', res.name);
            fillElement('user-blog', res.blog)
            fillElement('user-city', res.location);
            createBio(res.bio);
            userinfo['img_url'] = res.avatar_url;
            userinfo['name'] = res.name;
            userinfo['blog'] = res.blog;
            userinfo['city'] = res.location;
            userinfo['bio'] = res.bio;
            localStorage.setItem(userID, JSON.stringify(userinfo))
            return getPL(userID);
        })
        .then(res => {
            fillElement('user-lang', res);
            var info = JSON.parse(localStorage.getItem(userID));
            info['language'] = res;
            localStorage.setItem(userID, JSON.stringify(info));
        })
        .catch(err => {
            console.log(err)
            var errElement = document.getElementById('error-element');
            errElement.hidden = false;
        })
    }
    
}

// controls fetch button status(enable, disable)
var textInputChange = () => {
    var text = String(document.getElementById('user-id').value).trim();
    var suBtn = document.getElementById('submit-btn');
    if (text === "") {
        suBtn.disabled = true;
    } else {
        suBtn.disabled = false;
    }
}
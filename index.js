async function getUser(userID) {
    var url = "https://api.github.com/users/" + userID;
    return fetch(url)
        .then(res => res.json())
        .then(value => value)
        .catch(err => {
            throw new Error("username not found")
        })
}

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

var createBio = (text) => {
    element = document.getElementById('bio-text');
    element.innerHTML = text;
}

var fillElement = (elementId, value) => {
    var element = document.getElementById(elementId);
    element.innerHTML = value;
    if (elementId==='user-blog') {
        element.href = value;
    }
}

var setImage = (elementId, value) => {
    var element = document.getElementById(elementId);
    element.src = value;
}


var clickHandler = () => {
    var userID = String(document.getElementById('user-id').value).trim();
    getUser(userID)
    .then(res => {
        console.log(res)
        if(res.message === "Not Found") {
            throw new Error('user not found');
        }
        setImage('user-img', res.avatar_url);
        fillElement('user-name', res.name);
        fillElement('user-blog', res.blog)
        fillElement('user-city', res.location);
        createBio(res.bio);
        return getPL(userID);
    })
    .then(res => {
        fillElement('user-lang', res);
    })
    .catch(err => {
        console.log(err)
        var errElement = document.getElementById('error-element');
        errElement.hidden = false;
    })
}


var textInputChange = () => {
    var text = String(document.getElementById('user-id').value).trim();
    var suBtn = document.getElementById('submit-btn');
    if (text === "") {
        suBtn.disabled = true;
    } else {
        suBtn.disabled = false;
    }
}
let sub_btn = document.getElementById("btn");

sub_btn.addEventListener("click", img);

function img() {
    let isHd = document.getElementById("isHd").checked;
    let date = document.getElementById("date").value;
    let area = document.getElementById("display");

    let x = url(date);

    x.then((data) => {
        return validation(data, date);
    })
    .then((data) => {
        if (!isHd) return data.url;  
        return data.hdurl;           
    })
    .then((link) => {
        area.innerHTML = `<img src="${link}" id="pic" />`;
    })
    .catch(() => {
        alert("something is wrong in fetch");
    });
}

function validation(obj, date) {
    if (obj.media_type !== "image") {
        let prevDate = getPreviousDate(date);
        return url(prevDate).then((data) => validation(data, prevDate));
    }
    return obj;
}

function getPreviousDate(date) {
    let d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
}

function url(date) {
    return fetch(`https://api.nasa.gov/planetary/apod?api_key=7h35Cqp0fpD0eq6YLSF20w8Vw7QX5yOib7so8FMe&date=${date}`)
        .then((res) => res.json());
}
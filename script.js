let sub_btn = document.getElementById("btn");
let theme_toggle = document.getElementById("theme-toggle");

sub_btn.addEventListener("click", img);

theme_toggle.addEventListener("click", toggleTheme);

function toggleTheme() {
    let body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        theme_toggle.innerHTML = "Light Mode";
        localStorage.setItem('theme', 'dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        theme_toggle.innerHTML = "Dark Mode";
        localStorage.setItem('theme', 'light-mode');
    }
}

// Check for saved theme
window.addEventListener('DOMContentLoaded', () => {
    let savedTheme = localStorage.getItem('theme');
    let body = document.body;
    
    if (savedTheme === 'light-mode') {
        body.classList.add('light-mode');
        theme_toggle.innerHTML = "Dark Mode";
    } else {

        body.classList.add('dark-mode');
    }


    let dateInput = document.getElementById("date");
    dateInput.addEventListener('click', () => {
        if ('showPicker' in HTMLInputElement.prototype) {
            dateInput.showPicker();
        }
    });
});

function img() {
    let isHd = document.getElementById("isHd").checked;
    let date = document.getElementById("date").value;
    let area = document.getElementById("display");

    if (!date) {
        area.innerHTML = '<p class="placeholder-text" style="color:red;">Please select a date first!</p>';
        return;
    }

    // Show loading animation
    area.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p class="placeholder-text">Traveling through space...</p>
        </div>
    `;

    let x = url(date);

    x.then((data) => {
        if (data.code && data.code !== 200) {
            throw new Error(data.msg || "API Error");
        }
        return validation(data, date);
    })
    .then((data) => {
        let imageUrl = isHd && data.hdurl ? data.hdurl : data.url;
        if (!imageUrl) {
            throw new Error("No image URL available");
        }
        return imageUrl;
    })
    .then((link) => {
        let loadedImage = new Image();
        loadedImage.src = link;
        loadedImage.id = "pic";
        
        // Wait for image to fully load before showing it
        loadedImage.onload = () => {
            area.innerHTML = ''; 
            
            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";
            wrapper.appendChild(loadedImage);
            
            let controls = document.createElement("div");
            controls.className = "image-controls";
            
            let fullscreenBtn = document.createElement("button");
            fullscreenBtn.className = "control-btn";
            fullscreenBtn.innerHTML = "Full Screen";
            
            // Listen to browser fullscreen changes to automatically update text
            document.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement === wrapper) {
                    fullscreenBtn.innerHTML = "Exit Full Screen";
                } else {
                    fullscreenBtn.innerHTML = "Full Screen";
                }
            });

            fullscreenBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    wrapper.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen();
                }
            };
            
            controls.appendChild(fullscreenBtn);
            wrapper.appendChild(controls);
            area.appendChild(wrapper);
        };

        loadedImage.onerror = () => {
            area.innerHTML = `<p class="placeholder-text" style="color:red;">Failed to load the visual data.</p>`;
        };
        if (loadedImage.complete) {
            loadedImage.onload();
        }
    })
    .catch((err) => {
        console.error(err);
        area.innerHTML = `<p class="placeholder-text" style="color:red;">Failed to retrieve image: ${err.message || 'Please try again.'}</p>`;
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
        .then((res) => {if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
    
            }else{
                return res.json()
            }});
}
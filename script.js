const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const jobsContainer = document.getElementById("jobs-container");
const message = document.getElementById("message");
const savedJobsContainer = document.getElementById("saved-jobs-container");

let savedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
let currentJobs = [];

function searchJobs() {
    const keyword = searchInput.value.trim();

    if (!keyword) {
        message.textContent = "Please enter a keyword";
        return;
    }
    
    fetchJobs(keyword);
}

    function fetchJobs(keyword) {
        message.textContent = "Loading...";
        jobsContainer.innerHTML = "";

        const url = `https://www.arbeitnow.com/api/job-board-api?search=${keyword}`;

        fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            if (data.data.length === 0) {
                message.textContent = "No jobs found.";
                return;
            }

            message.textContent = "";
            currentJobs = data.data;
            displayJobs(data.data);
        })
        .catch(function (error) {
            message.textContent = "Error loading jobs.";
            console.log(error);
        });
    }

    function displayJobs(jobs) {
        jobsContainer.innerHTML = "";

        if (jobs.length === 0) {
            jobsContainer.innerHTML = "<p>No jobs found.</p>";
        }

        jobs.forEach(function (job) {
            const card = document.createElement("div");
            card.classList.add("job-card");

            const isSaved = savedJobs.some(function (item) {
                return item.slug === job.slug;
            });

            card.innerHTML = `
              <h3>${job.title}</h3>
              <p><strong>Company:</strong> ${job.company_name}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <a href="${job.url}" target="_blank">Apply</a>
              <button class="save-btn" data-id="${job.slug}" ${isSaved ? "disabled" : ""}>
                ${isSaved ? "Saved" : "Save job"}
              </button>
            `;

            jobsContainer.appendChild(card);
        });

        const saveButtons = document.querySelectorAll(".save-btn");

        saveButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const jobId = button.dataset.id;

                const selectedJob = jobs.find(function (job) {
                    return job.slug === jobId;
                });

                addToSavedJobs(selectedJob);
            });
        });

    }

    function addToSavedJobs(job) {
        const alreadySaved = savedJobs.some(function (item) {
            return item.slug === job.slug;
        });

        if (alreadySaved) {
            alert("Job already saved.");
            return;
        }

        savedJobs.push(job);
        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));

        displaySavedJobs();
        displayJobs(currentJobs);
    }

    function displaySavedJobs() {
        savedJobsContainer.innerHTML = "";

        if (savedJobs.length === 0) {
            savedJobsContainer.innerHTML = "<p>No saved jobs yet.</p>"
            return;
        }

        savedJobs.forEach(function (job) {
            const card = document.createElement("div");
            card.classList.add("job-card");

            card.innerHTML = `
              <h3>${job.title}</h3>
              <p><strong>Company:</strong> ${job.company_name || "unknown"}</p>
              <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
              <a href="${job.url}" target="_blank">Apply</a>
              <button class="remove-btn" data-id="${job.slug}">Remove</button>
            `;

            savedJobsContainer.appendChild(card);
        });

        const removeButtons = document.querySelectorAll(".remove-btn");

        removeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const jobId = button.dataset.id;
                removeSavedJob(jobId);
            });
        });
    }

    function removeSavedJob(jobId) {
        savedJobs = savedJobs.filter(function (job) {
            return job.slug !== jobId;
        });

        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
        displaySavedJobs();
        displayJobs(currentJobs);
    }


    searchBtn.addEventListener("click", searchJobs);

    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            searchJobs();
        }
    });

    displaySavedJobs();


// Load content from smith.txt file
async function loadContent() {
  try {
    const response = await fetch("../data/smith.txt");
    const content = await response.text();
    updateContentFromText(content);
  } catch (error) {
    console.log("Không thể tải file smith.txt, sử dụng nội dung mặc định");
  }
}

// Parse and update content from text file
function updateContentFromText(content) {
  const lines = content.split("\n");
  let currentSection = "";
  let experienceData = [];
  let educationData = [];
  let projectsData = [];
  let skillsData = {};
  let languagesData = [];
  let interestsData = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("=====")) continue;

    // Detect sections
    if (line.includes("THÔNG TIN CÁ NHÂN:")) {
      currentSection = "personal";
    } else if (line.includes("GIỚI THIỆU:")) {
      currentSection = "introduction";
    } else if (line.includes("KỸ NĂNG")) {
      currentSection = "skills";
    } else if (line.includes("KINH NGHIỆM")) {
      currentSection = "experience";
    } else if (line.includes("HỌC VẤN:")) {
      currentSection = "education";
    } else if (line.includes("DỰ ÁN")) {
      currentSection = "projects";
    } else if (line.includes("NGÔN NGỮ:")) {
      currentSection = "languages";
    } else if (line.includes("SỞ THÍCH:")) {
      currentSection = "interests";
    }

    // Update content based on section
    if (currentSection === "personal") {
      updatePersonalInfo(line);
    } else if (
      currentSection === "introduction" &&
      line &&
      !line.includes("GIỚI THIỆU:")
    ) {
      updateIntroduction(line);
    } else if (currentSection === "skills") {
      parseSkills(line, skillsData);
    } else if (currentSection === "experience") {
      parseExperience(line, experienceData);
    } else if (currentSection === "education") {
      parseEducation(line, educationData);
    } else if (currentSection === "projects") {
      parseProjects(line, projectsData);
    } else if (currentSection === "languages") {
      parseLanguages(line, languagesData);
    } else if (currentSection === "interests") {
      parseInterests(line, interestsData);
    }
  }

  // Update DOM with parsed data
  updateSkillsDOM(skillsData);
  updateExperienceDOM(experienceData);
  updateEducationDOM(educationData);
  updateProjectsDOM(projectsData);
  updateLanguagesDOM(languagesData);
  updateInterestsDOM(interestsData);
}

// Update personal information
function updatePersonalInfo(line) {
  if (line.includes("Họ tên:")) {
    const name = line.split(":")[1].trim();
    document.getElementById("fullName").textContent = name;

    const profileImgContainer = document.querySelector(".profile-img");
    const img = profileImgContainer.querySelector("img");

    // Tạo initials từ tên
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    // Xử lý khi ảnh lỗi hoặc không tồn tại
    if (img) {
      img.onerror = function () {
        this.style.display = "none"; // Ẩn ảnh bị lỗi
        profileImgContainer.textContent = initials; // Hiển thị initials
      };
    } else {
      profileImgContainer.textContent = initials;
    }
  } else if (line.includes("Chức vụ:")) {
    const title = line.split(":")[1].trim();
    document.getElementById("jobTitle").textContent = title;
  } else if (line.includes("Email:")) {
    const email = line.split(":")[1].trim();
    document.getElementById("email").textContent = email;
  } else if (line.includes("Điện thoại:")) {
    const phone = line.split(":")[1].trim();
    document.getElementById("phone").textContent = phone;
  } else if (line.includes("Địa chỉ:")) {
    const address = line.split(":")[1].trim();
    document.getElementById("address").textContent = address;
  }
}

// Update introduction
function updateIntroduction(line) {
  document.getElementById("introduction").textContent = line;
}

// Parse skills section
function parseSkills(line, skillsData) {
  if (line.includes("•") && line.includes(":")) {
    const category = line.split(":")[0].replace("•", "").trim();
    skillsData[category] = [];
  } else if (line.includes("-") && line.includes(":")) {
    const skillLine = line.replace("-", "").trim();
    const [skill, percentage] = skillLine.split(":");
    if (skill && percentage) {
      const categories = Object.keys(skillsData);
      const currentCategory = categories[categories.length - 1];
      if (currentCategory) {
        skillsData[currentCategory].push({
          name: skill.trim(),
          level: percentage.trim().replace("%", ""),
        });
      }
    }
  }
}

// Parse experience section
function parseExperience(line, experienceData) {
  if (line.match(/^\d+\./)) {
    const parts = line.split("|");
    if (parts.length >= 2) {
      const titleAndCompany = parts[0].replace(/^\d+\./, "").trim();
      const companyAndDate = parts[1].trim();
      const [company, dateRange] = companyAndDate.split("(");

      experienceData.push({
        title: titleAndCompany,
        company: company.trim(),
        date: dateRange ? dateRange.replace(")", "").trim() : "",
        description: [],
      });
    }
  } else if (line.startsWith("-") && experienceData.length > 0) {
    const description = line.replace("-", "").trim();
    experienceData[experienceData.length - 1].description.push(description);
  }
}

// Parse education section
function parseEducation(line, educationData) {
  if (line.includes("•") && line.includes("|")) {
    const parts = line.split("|");
    if (parts.length >= 2) {
      const degree = parts[0].replace("•", "").trim();
      const schoolAndDate = parts[1].trim();
      const [school, dateRange] = schoolAndDate.split("(");

      educationData.push({
        degree: degree,
        school: school.trim(),
        date: dateRange ? dateRange.replace(")", "").trim() : "",
        description: [],
      });
    }
  } else if (line.startsWith("-") && educationData.length > 0) {
    const description = line.replace("-", "").trim();
    educationData[educationData.length - 1].description.push(description);
  }
}

// Parse projects section
function parseProjects(line, projectsData) {
  if (line.match(/^\d+\./)) {
    const parts = line.split("(");
    if (parts.length >= 2) {
      const title = parts[0].replace(/^\d+\./, "").trim();
      const year = parts[1].replace(")", "").trim();

      projectsData.push({
        title: title,
        year: year,
        technology: "",
        description: "",
        result: "",
        link: "",
      });
    }
  } else if (line.includes("Công nghệ:") && projectsData.length > 0) {
    projectsData[projectsData.length - 1].technology = line
      .split(":")[1]
      .trim();
  } else if (line.includes("Mô tả:") && projectsData.length > 0) {
    projectsData[projectsData.length - 1].description = line
      .split(":")[1]
      .trim();
  } else if (line.includes("Kết quả:") && projectsData.length > 0) {
    projectsData[projectsData.length - 1].result = line.split(":")[1].trim();
  } else if (line.includes("Link:") && projectsData.length > 0) {
    projectsData[projectsData.length - 1].link = line.split(":")[1].trim();
  }
}

// Parse languages section
function parseLanguages(line, languagesData) {
  if (line.includes("•") && line.includes("-")) {
    const parts = line.split("-");
    if (parts.length >= 2) {
      const language = parts[0].replace("•", "").trim();
      const level = parts[1].trim();
      languagesData.push({ language, level });
    }
  }
}

// Parse interests section
function parseInterests(line, interestsData) {
  if (line.includes("•")) {
    const interest = line.replace("•", "").trim();
    interestsData.push(interest);
  }
}

// Update skills in DOM
function updateSkillsDOM(skillsData) {
  // Update Programming Skills
  const programmingSkills = document.getElementById("programmingSkills");
  if (skillsData["Lập trình"]) {
    programmingSkills.innerHTML = "";
    skillsData["Lập trình"].forEach((skill) => {
      const skillElement = document.createElement("div");
      skillElement.className = "skill-item";
      skillElement.innerHTML = `
                <span>${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                </div>
            `;
      programmingSkills.appendChild(skillElement);
    });
  }

  // Update Database Skills
  const databaseSkills = document.getElementById("databaseSkills");
  if (skillsData["Cơ sở dữ liệu"]) {
    databaseSkills.innerHTML = "";
    skillsData["Cơ sở dữ liệu"].forEach((skill) => {
      const skillElement = document.createElement("div");
      skillElement.className = "skill-item";
      skillElement.innerHTML = `
                <span>${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                </div>
            `;
      databaseSkills.appendChild(skillElement);
    });
  }

  // Update Tools & Framework Skills
  const toolsSkills = document.getElementById("toolsSkills");
  if (skillsData["Công cụ & Framework"]) {
    toolsSkills.innerHTML = "";
    skillsData["Công cụ & Framework"].forEach((skill) => {
      const skillElement = document.createElement("div");
      skillElement.className = "skill-item";
      skillElement.innerHTML = `
                <span>${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                </div>
            `;
      toolsSkills.appendChild(skillElement);
    });
  }
}

// Update experience in DOM
function updateExperienceDOM(experienceData) {
  const experienceList = document.getElementById("experienceList");
  if (experienceData.length > 0) {
    experienceList.innerHTML = "";
    experienceData.forEach((exp) => {
      const expElement = document.createElement("div");
      expElement.className = "experience-item";
      expElement.innerHTML = `
                <h3>${exp.title}</h3>
                <div class="company">${exp.company}</div>
                <div class="date">${exp.date}</div>
                <div>${exp.description
                  .map((desc) => `<p>• ${desc}</p>`)
                  .join("")}</div>
            `;
      experienceList.appendChild(expElement);
    });
  }
}

// Update education in DOM
function updateEducationDOM(educationData) {
  const educationList = document.getElementById("educationList");
  if (educationData.length > 0) {
    educationList.innerHTML = "";
    educationData.forEach((edu) => {
      const eduElement = document.createElement("div");
      eduElement.className = "education-item";
      eduElement.innerHTML = `
                <h3>${edu.degree}</h3>
                <div class="school">${edu.school}</div>
                <div class="date">${edu.date}</div>
                <div>${edu.description
                  .map((desc) => `<p>• ${desc}</p>`)
                  .join("")}</div>
            `;
      educationList.appendChild(eduElement);
    });
  }
}

// Update projects in DOM
function updateProjectsDOM(projectsData) {
  const projectsList = document.getElementById("projectsList");
  if (projectsData.length > 0) {
    projectsList.innerHTML = "";
    projectsData.forEach((project) => {
      const projectElement = document.createElement("div");
      projectElement.className = "experience-item";
      projectElement.innerHTML = `
                <h3>${project.title}</h3>
                <div class="company">Công nghệ: ${project.technology}</div>
                <div class="date">${project.year}</div>
                <p>${project.description}</p>
                ${
                  project.result
                    ? `<p><strong>Kết quả:</strong> ${project.result}</p>`
                    : ""
                }
                ${
                  project.link
                    ? `<p><strong>Link:</strong> <a href="${project.link}" target="_blank">${project.link}</a></p>`
                    : ""
                }
            `;
      projectsList.appendChild(projectElement);
    });
  }
}

// Update languages in DOM
function updateLanguagesDOM(languagesData) {
  const languagesList = document.getElementById("languagesList");
  if (languagesData.length > 0) {
    languagesList.innerHTML = "";
    languagesData.forEach((lang) => {
      const langElement = document.createElement("li");
      langElement.innerHTML = `
                <span>${lang.language}</span>
                <span class="language-level">${lang.level}</span>
            `;
      languagesList.appendChild(langElement);
    });
  }
}

// Update interests in DOM
function updateInterestsDOM(interestsData) {
  const interestsList = document.getElementById("interestsList");
  if (interestsData.length > 0) {
    interestsList.innerHTML = "";
    interestsData.forEach((interest) => {
      const interestElement = document.createElement("li");
      interestElement.textContent = interest;
      interestsList.appendChild(interestElement);
    });
  }
}

// Smooth scrolling animation
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
  });

  // Load content from file
  loadContent();
});

// Interactive skill bars animation
function initializeSkillBars() {
  const skillBars = document.querySelectorAll(".skill-progress");
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const skillBar = entry.target;
        const width = skillBar.style.width;
        skillBar.style.width = "0%";
        setTimeout(() => {
          skillBar.style.width = width;
        }, 200);
      }
    });
  }, observerOptions);

  skillBars.forEach((bar) => {
    observer.observe(bar);
  });
}

// Initialize skill bars after content is loaded
setTimeout(initializeSkillBars, 1000);

// Utility function to create elements
function createElement(tag, className, innerHTML) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

// Export functions for potential use in other scripts
window.CVManager = {
  loadContent,
  updateContentFromText,
  initializeSkillBars,
};

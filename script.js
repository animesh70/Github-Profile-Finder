const APIURL = "https://api.github.com/users/";

const form = document.getElementById("form");
const main = document.getElementById("main");
const search = document.getElementById("search");
const historyBar = document.getElementById("history-bar");

const searchModeBtn = document.getElementById("search-mode-btn");
const repoModeBtn = document.getElementById("repo-mode-btn");
const battleModeBtn = document.getElementById("battle-mode-btn");
const searchSection = document.getElementById("search-section");
const repoSection = document.getElementById("repo-section");
const battleSection = document.getElementById("battle-section");

const repoForm = document.getElementById("repo-form");
const repoMain = document.getElementById("repo-main");
const repoSearch = document.getElementById("repo-search");
const repoHistoryBar = document.getElementById("repo-history-bar");

const player1Input = document.getElementById("player1-input");
const player2Input = document.getElementById("player2-input");
const battleBtn = document.getElementById("battle-btn");
const randomBtn = document.getElementById("random-btn");
const battleHistoryBar = document.getElementById("battle-history-bar");

const player1Container = document.getElementById("player1-container");
const player2Container = document.getElementById("player2-container");
const player1Card = document.getElementById("player1-card");
const player2Card = document.getElementById("player2-card");
const player1Stats = document.getElementById("player1-stats");
const player2Stats = document.getElementById("player2-stats");
const vsContainer = document.getElementById("vs-container");

const winnerBanner = document.getElementById("winner-banner");
const winnerText = document.getElementById("winner-text");
const winnerScore = document.getElementById("winner-score");
const battleActions = document.getElementById("battle-actions");
const downloadBattleBtn = document.getElementById("download-battle-btn");
const shareBattleBtn = document.getElementById("share-battle-btn");

const battleSound = document.getElementById("battle-sound");
const winnerSound = document.getElementById("winner-sound");
const confettiContainer = document.getElementById("confetti-container");

const HISTORY_KEY = "github_search_history";
const REPO_HISTORY_KEY = "github_repo_search_history";
const BATTLE_HISTORY_KEY = "github_battle_history";
const MAX_HISTORY = 5;

const FAMOUS_DEVS = [
  "torvalds", "gaearon", "sindresorhus", "yyx990803", "tj",
  "addyosmani", "paulirish", "mrdoob", "substack", "fat",
  "kentcdodds", "wesbos", "bradtraversy", "getify", "flaviocopes"
];

const getSearchHistory = () => {
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

const saveToHistory = (username) => {
  let history = getSearchHistory();
  history = history.filter((item) => item.toLowerCase() !== username.toLowerCase());
  history.unshift(username);
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
};

const renderHistory = () => {
  const history = getSearchHistory();
  historyBar.innerHTML = "";
  history.forEach((username) => {
    const item = document.createElement("span");
    item.classList.add("history-item");
    item.textContent = username;
    item.addEventListener("click", () => {
      getUser(username);
    });
    historyBar.appendChild(item);
  });
};

const getRepoSearchHistory = () => {
  const history = localStorage.getItem(REPO_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

const saveToRepoHistory = (query) => {
  let history = getRepoSearchHistory();
  history = history.filter((item) => item.toLowerCase() !== query.toLowerCase());
  history.unshift(query);
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  localStorage.setItem(REPO_HISTORY_KEY, JSON.stringify(history));
  renderRepoHistory();
};

const renderRepoHistory = () => {
  const history = getRepoSearchHistory();
  repoHistoryBar.innerHTML = "";
  history.forEach((query) => {
    const item = document.createElement("span");
    item.classList.add("history-item");
    item.textContent = query;
    item.addEventListener("click", () => {
      searchRepos(query);
    });
    repoHistoryBar.appendChild(item);
  });
};

const getBattleHistory = () => {
  const history = localStorage.getItem(BATTLE_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

const saveBattleToHistory = (player1, player2, winner) => {
  let history = getBattleHistory();
  const battle = { player1, player2, winner, date: new Date().toISOString() };
  history.unshift(battle);
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  localStorage.setItem(BATTLE_HISTORY_KEY, JSON.stringify(history));
  renderBattleHistory();
};

const renderBattleHistory = () => {
  const history = getBattleHistory();
  battleHistoryBar.innerHTML = "";
  if (history.length > 0) {
    const label = document.createElement("span");
    label.style.color = "#20232a";
    label.style.fontSize = "0.8rem";
    label.textContent = "Recent: ";
    battleHistoryBar.appendChild(label);
  }
  history.forEach((battle) => {
    const item = document.createElement("span");
    item.classList.add("battle-history-item");
    item.textContent = `${battle.player1} vs ${battle.player2}`;
    item.addEventListener("click", () => {
      player1Input.value = battle.player1;
      player2Input.value = battle.player2;
      startBattle();
    });
    battleHistoryBar.appendChild(item);
  });
};

const createUserCard = (user) => {
  const cardHTML = `
    <div class="card" id="user-card">
        <div class="avatar-container">
          <img
            src="${user.avatar_url}"
            alt="${user.name}"
            class="avatar"
          />
          <button class="download-btn" id="download-btn" title="Download Card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
        </div>
        <div class="user-info">
          <h2>${user.name || user.login}</h2>
          <p>${user.bio || 'No bio available'}</p>
          <ul>
            <li>${user.followers}<strong>Followers</strong></li>
            <li>${user.following}<strong>Following</strong></li>
            <li>${user.public_repos}<strong>Repos</strong></li>
          </ul>
          <div id="repos"></div>
        </div>
      </div>
    `;
  main.innerHTML = cardHTML;

  const downloadBtn = document.getElementById("download-btn");
  downloadBtn.addEventListener("click", () => downloadCard(user.login));
};

const downloadCard = async (username) => {
  const card = document.getElementById("user-card");
  const downloadBtn = document.getElementById("download-btn");
  if (!card) return;

  try {
    downloadBtn.style.display = "none";
    
    const dataUrl = await htmlToImage.toJpeg(card, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#20232a",
    });

    downloadBtn.style.display = "flex";

    const link = document.createElement("a");
    link.download = `${username}-github-card.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Error generating image:", error);
    downloadBtn.style.display = "flex";
  }
};

const createErrorCard = (message) => {
  const cardHTML = `<div class="card"><h1>${message}</h1></div>`;
  main.innerHTML = cardHTML;
};

const addReposToCard = (repos) => {
  const reposElement = document.getElementById("repos");
  if (!reposElement) return;
  repos.slice(0, 5).forEach((repo) => {
    const repoElement = document.createElement("a");
    repoElement.classList.add("repo");
    repoElement.href = repo.html_url;
    repoElement.target = "_blank";
    repoElement.innerText = repo.name;
    reposElement.appendChild(repoElement);
  });
};

const getUser = async (username) => {
  try {
    const { data } = await axios(APIURL + username);
    createUserCard(data);
    getRepos(username);
    saveToHistory(username);
  } catch (error) {
    if (error.response && error.response.status == 404)
      createErrorCard("No profile with this username");
  }
};

const getRepos = async (username) => {
  try {
    const { data } = await axios(APIURL + username + "/repos?sort=created");
    addReposToCard(data);
  } catch (error) {
    createErrorCard("Problem fetching repos");
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = search.value;
  if (user) {
    getUser(user);
    search.value = "";
  }
});

const searchRepos = async (query) => {
  try {
    const { data } = await axios(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`);
    createRepoResults(data.items, query);
    saveToRepoHistory(query);
  } catch (error) {
    createRepoError("Error searching repositories. Please try again.");
    console.error(error);
  }
};

const createRepoResults = (repos, query) => {
  if (repos.length === 0) {
    repoMain.innerHTML = `<div class="card"><h1>No repositories found for "${query}"</h1></div>`;
    return;
  }

  let html = `<div class="repo-results">
    <h2 class="repo-results-title">Results for "${query}"</h2>
    <div class="repo-list">`;

  repos.forEach((repo) => {
    html += `
      <div class="repo-card">
        <div class="repo-header">
          <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="repo-owner-avatar" />
          <div class="repo-info">
            <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.full_name}</a>
            <p class="repo-description">${repo.description || 'No description available'}</p>
          </div>
        </div>
        <div class="repo-stats">
          <span class="repo-stat"><strong>${repo.stargazers_count.toLocaleString()}</strong> Stars</span>
          <span class="repo-stat"><strong>${repo.forks_count.toLocaleString()}</strong> Forks</span>
          <span class="repo-stat"><strong>${repo.open_issues_count.toLocaleString()}</strong> Issues</span>
        </div>
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ''}
          <span class="repo-updated">Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    `;
  });

  html += `</div></div>`;
  repoMain.innerHTML = html;
};

const createRepoError = (message) => {
  repoMain.innerHTML = `<div class="card"><h1>${message}</h1></div>`;
};

repoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = repoSearch.value.trim();
  if (query) {
    searchRepos(query);
    repoSearch.value = "";
  }
});

searchModeBtn.addEventListener("click", () => {
  searchModeBtn.classList.add("active");
  repoModeBtn.classList.remove("active");
  battleModeBtn.classList.remove("active");
  searchSection.classList.add("active");
  repoSection.classList.remove("active");
  battleSection.classList.remove("active");
});

repoModeBtn.addEventListener("click", () => {
  repoModeBtn.classList.add("active");
  searchModeBtn.classList.remove("active");
  battleModeBtn.classList.remove("active");
  repoSection.classList.add("active");
  searchSection.classList.remove("active");
  battleSection.classList.remove("active");
});

battleModeBtn.addEventListener("click", () => {
  battleModeBtn.classList.add("active");
  searchModeBtn.classList.remove("active");
  repoModeBtn.classList.remove("active");
  battleSection.classList.add("active");
  searchSection.classList.remove("active");
  repoSection.classList.remove("active");
});

const getAchievementBadges = (user) => {
  const badges = [];
  if (user.followers >= 10000) {
    badges.push('<span class="achievement-badge badge-10k">10K Club</span>');
  }
  if (user.public_repos >= 100) {
    badges.push('<span class="achievement-badge badge-prolific">Prolific</span>');
  }
  if (user.followers >= 1000) {
    badges.push('<span class="achievement-badge badge-popular">Popular</span>');
  }
  if (user.public_repos >= 50) {
    badges.push('<span class="achievement-badge badge-active">Active</span>');
  }
  return badges.join("");
};

const createBattleCard = (user, containerId) => {
  const container = document.getElementById(containerId);
  const badges = getAchievementBadges(user);
  container.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.name}" class="avatar" />
    <h3>${user.name || user.login}</h3>
    <p>${user.bio ? user.bio.substring(0, 60) + (user.bio.length > 60 ? '...' : '') : 'No bio'}</p>
    <div class="badges">${badges}</div>
  `;
};

const calculateTotalStars = async (username) => {
  try {
    const { data } = await axios(APIURL + username + "/repos?per_page=100");
    return data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  } catch {
    return 0;
  }
};

const createStatBars = (stats1, stats2, container1Id, container2Id) => {
  const container1 = document.getElementById(container1Id);
  const container2 = document.getElementById(container2Id);

  const categories = [
    { label: "Followers", key: "followers" },
    { label: "Following", key: "following" },
    { label: "Repos", key: "repos" },
    { label: "Stars", key: "stars" }
  ];

  container1.innerHTML = "";
  container2.innerHTML = "";

  categories.forEach((cat) => {
    const val1 = stats1[cat.key];
    const val2 = stats2[cat.key];
    const max = Math.max(val1, val2, 1);

    const class1 = val1 > val2 ? "winner" : val1 < val2 ? "loser" : "tie";
    const class2 = val2 > val1 ? "winner" : val2 < val1 ? "loser" : "tie";

    container1.innerHTML += `
      <div class="stat-bar">
        <span class="stat-label">${cat.label}</span>
        <div class="stat-fill-container">
          <div class="stat-fill ${class1}" style="width: 0%" data-width="${(val1 / max) * 100}">${val1}</div>
        </div>
      </div>
    `;

    container2.innerHTML += `
      <div class="stat-bar">
        <span class="stat-label">${cat.label}</span>
        <div class="stat-fill-container">
          <div class="stat-fill ${class2}" style="width: 0%" data-width="${(val2 / max) * 100}">${val2}</div>
        </div>
      </div>
    `;
  });

  setTimeout(() => {
    document.querySelectorAll(".stat-fill").forEach((fill) => {
      fill.style.width = fill.dataset.width + "%";
    });
  }, 100);
};

const calculateScore = (stats) => {
  return stats.followers * 2 + stats.repos * 3 + stats.stars * 5;
};

const createConfetti = () => {
  const colors = ["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888", "#4CAF50", "#2196F3"];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + "s";
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    confettiContainer.appendChild(confetti);
  }
  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 5000);
};

const playSound = (sound) => {
  try {
    sound.currentTime = 0;
    sound.volume = 0.3;
    sound.play().catch(() => {});
  } catch {}
};

const resetBattleUI = () => {
  player1Container.classList.remove("visible");
  player2Container.classList.remove("visible");
  vsContainer.classList.remove("visible");
  winnerBanner.classList.add("hidden");
  battleActions.classList.add("hidden");
  player1Card.innerHTML = "";
  player2Card.innerHTML = "";
  player1Stats.innerHTML = "";
  player2Stats.innerHTML = "";
  confettiContainer.innerHTML = "";
};

const startBattle = async () => {
  const username1 = player1Input.value.trim();
  const username2 = player2Input.value.trim();

  if (!username1 || !username2) {
    alert("Please enter both usernames!");
    return;
  }

  resetBattleUI();
  playSound(battleSound);

  try {
    const [user1Response, user2Response] = await Promise.all([
      axios(APIURL + username1),
      axios(APIURL + username2)
    ]);

    const user1 = user1Response.data;
    const user2 = user2Response.data;

    const [stars1, stars2] = await Promise.all([
      calculateTotalStars(username1),
      calculateTotalStars(username2)
    ]);

    const stats1 = {
      followers: user1.followers,
      following: user1.following,
      repos: user1.public_repos,
      stars: stars1
    };

    const stats2 = {
      followers: user2.followers,
      following: user2.following,
      repos: user2.public_repos,
      stars: stars2
    };

    createBattleCard(user1, "player1-card");
    createBattleCard(user2, "player2-card");

    setTimeout(() => {
      player1Container.classList.add("visible");
    }, 100);

    setTimeout(() => {
      vsContainer.classList.add("visible");
    }, 400);

    setTimeout(() => {
      player2Container.classList.add("visible");
      player2Container.classList.add("player2");
    }, 700);

    setTimeout(() => {
      createStatBars(stats1, stats2, "player1-stats", "player2-stats");
    }, 1000);

    setTimeout(() => {
      const score1 = calculateScore(stats1);
      const score2 = calculateScore(stats2);

      let winner, winnerName;
      if (score1 > score2) {
        winner = user1;
        winnerName = user1.name || user1.login;
      } else if (score2 > score1) {
        winner = user2;
        winnerName = user2.name || user2.login;
      } else {
        winnerName = "It's a Tie!";
      }

      winnerText.textContent = score1 === score2 ? "It's a Tie!" : `${winnerName} Wins!`;
      winnerScore.textContent = `Score: ${Math.max(score1, score2)} vs ${Math.min(score1, score2)}`;
      winnerBanner.classList.remove("hidden");
      battleActions.classList.remove("hidden");

      playSound(winnerSound);
      createConfetti();

      saveBattleToHistory(username1, username2, score1 > score2 ? username1 : score2 > score1 ? username2 : "tie");
    }, 2000);

  } catch (error) {
    alert("Error fetching user data. Please check the usernames.");
    console.error(error);
  }
};

battleBtn.addEventListener("click", startBattle);

player1Input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") startBattle();
});

player2Input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") startBattle();
});

randomBtn.addEventListener("click", () => {
  const randomDev = FAMOUS_DEVS[Math.floor(Math.random() * FAMOUS_DEVS.length)];
  player2Input.value = randomDev;
});

downloadBattleBtn.addEventListener("click", async () => {
  const arena = document.getElementById("battle-arena");
  const banner = document.getElementById("winner-banner");
  
  const wrapper = document.createElement("div");
  wrapper.style.background = "#aeadaf";
  wrapper.style.padding = "20px";
  wrapper.style.display = "inline-block";
  
  const arenaClone = arena.cloneNode(true);
  const bannerClone = banner.cloneNode(true);
  bannerClone.classList.remove("hidden");
  
  wrapper.appendChild(arenaClone);
  wrapper.appendChild(bannerClone);
  document.body.appendChild(wrapper);

  try {
    const dataUrl = await htmlToImage.toJpeg(wrapper, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#aeadaf",
    });

    const link = document.createElement("a");
    link.download = `battle-${player1Input.value}-vs-${player2Input.value}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Error generating battle image:", error);
  }

  document.body.removeChild(wrapper);
});

shareBattleBtn.addEventListener("click", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("battle", `${player1Input.value},${player2Input.value}`);
  navigator.clipboard.writeText(url.toString()).then(() => {
    alert("Battle link copied to clipboard!");
  }).catch(() => {
    prompt("Copy this link:", url.toString());
  });
});

const checkUrlForBattle = () => {
  const params = new URLSearchParams(window.location.search);
  const battle = params.get("battle");
  if (battle) {
    const [p1, p2] = battle.split(",");
    if (p1 && p2) {
      battleModeBtn.click();
      player1Input.value = p1;
      player2Input.value = p2;
      setTimeout(() => startBattle(), 500);
    }
  }
};

renderHistory();
renderRepoHistory();
renderBattleHistory();
checkUrlForBattle();

// الحسابات
function getAccounts() {
    return JSON.parse(localStorage.getItem("fgAccounts") || "[]");
}

// عرض تسجيل الدخول
function showLogin() {
    document.getElementById("loginForm").hidden = false;
    document.getElementById("registerForm").hidden = true;
    document.getElementById("authMessage").textContent = "";
}

// عرض إنشاء حساب
function showRegister() {
    document.getElementById("loginForm").hidden = true;
    document.getElementById("registerForm").hidden = false;
    document.getElementById("authMessage").textContent = "";
}

// إنشاء حساب
function register() {
    const user = document.getElementById("newUser").value.trim();
    const pass = document.getElementById("newPass").value;

    if (!user || !pass) {
        alert("اكتبي اسم المستخدم وكلمة المرور");
        return;
    }

    let accounts = getAccounts();

    if (accounts.some(a => a.user === user)) {
        alert("اسم المستخدم موجود بالفعل");
        return;
    }

    accounts.push({ user: user, pass: pass });
    localStorage.setItem("fgAccounts", JSON.stringify(accounts));

    alert("تم إنشاء الحساب بنجاح، سجلي الدخول الآن");
    document.getElementById("newUser").value = "";
    document.getElementById("newPass").value = "";
    showLogin();
}

// تسجيل الدخول
function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;

    if (!user || !pass) {
        alert("اكتبي اسم المستخدم وكلمة المرور");
        return;
    }

    const accounts = getAccounts();
    const found = accounts.find(a => a.user === user && a.pass === pass);

    if (found) {
        sessionStorage.setItem("fgCurrentUser", user);
        document.getElementById("authPage").hidden = true;
        document.getElementById("website").hidden = false;
        showPage("home");
        alert("مرحباً بك في Fun Games");
    } else {
        alert("اسم المستخدم أو كلمة المرور غير صحيحة. أنشئي حساباً أولاً إذا لم يكن لديك حساب.");
    }
}

// فتح صفحة الدخول
function openLoginPage() {
    document.getElementById("website").hidden = true;
    document.getElementById("authPage").hidden = false;
    showLogin();
}

// تسجيل الخروج
function logout() {
    sessionStorage.removeItem("fgCurrentUser");
    document.getElementById("website").hidden = false;
    showPage("logoutPage");
}

// التنقل بين الصفحات
function showPage(id) {
    document.querySelectorAll(".page").forEach(page => {
        page.hidden = true;
    });

    document.getElementById("gamePage").hidden = true;
    document.getElementById(id).hidden = false;
}

// فتح لعبة
function openGame(id) {
    document.getElementById("games").hidden = true;
    document.getElementById("gamePage").hidden = false;

    document.querySelectorAll(".game-area").forEach(game => {
        game.hidden = true;
    });

    document.getElementById(id).hidden = false;

    if (id === "xoGame") resetXO();
    if (id === "guessGame") resetGuess();
    if (id === "memoryGame") startMemory();
}

// لعبة XO
let xoBoard = ["", "", "", "", "", "", "", "", ""];
let xoTurn = "X";
let xoFinished = false;

function xoMove(index) {
    if (xoBoard[index] !== "" || xoFinished) return;

    xoBoard[index] = xoTurn;

    const buttons = document.querySelectorAll(".xo-board button");
    buttons[index].textContent = xoTurn;

    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    if (wins.some(line => line.every(i => xoBoard[i] === xoTurn))) {
        document.getElementById("xoStatus").textContent =
            "الفائز هو اللاعب " + xoTurn + " 🎉";
        xoFinished = true;
        return;
    }

    if (xoBoard.every(cell => cell !== "")) {
        document.getElementById("xoStatus").textContent = "تعادل!";
        xoFinished = true;
        return;
    }

    xoTurn = xoTurn === "X" ? "O" : "X";
    document.getElementById("xoStatus").textContent =
        "دور اللاعب " + xoTurn;
}

function resetXO() {
    xoBoard = ["", "", "", "", "", "", "", "", ""];
    xoTurn = "X";
    xoFinished = false;

    document.querySelectorAll(".xo-board button").forEach(button => {
        button.textContent = "";
    });

    document.getElementById("xoStatus").textContent = "دور اللاعب X";
}

// لعبة تخمين الرقم
let secretNumber = 0;

function resetGuess() {
    secretNumber = Math.floor(Math.random() * 10) + 1;
    document.getElementById("guessInput").value = "";
    document.getElementById("guessResult").textContent = "";
}

function checkGuess() {
    const value = Number(document.getElementById("guessInput").value);
    const result = document.getElementById("guessResult");

    if (!Number.isInteger(value) || value < 1 || value > 10) {
        result.textContent = "اختاري رقماً من 1 إلى 10";
        return;
    }

    if (value === secretNumber) {
        result.textContent = "🎉 إجابة صحيحة! أحسنتِ";
    } else if (value < secretNumber) {
        result.textContent = "الرقم أكبر، حاولي مرة أخرى";
    } else {
        result.textContent = "الرقم أصغر، حاولي مرة أخرى";
    }
}

// لعبة الذاكرة
let memoryValues = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matched = 0;

function startMemory() {
    const emojis = ["🍎", "🍌", "🍇", "🍓", "🍎", "🍌", "🍇", "🍓"];

    memoryValues = emojis.sort(() => Math.random() - 0.5);
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matched = 0;

    document.getElementById("memoryResult").textContent = "";
    drawMemory();
}

function drawMemory() {
    const board = document.getElementById("memoryBoard");
    board.innerHTML = "";

    memoryValues.forEach((value, index) => {
        const button = document.createElement("button");
        button.className = "memory-card";
        button.textContent = "❓";
        button.dataset.value = value;
        button.onclick = function() {
            flipCard(button);
        };
        board.appendChild(button);
    });
}

function flipCard(card) {
    if (lockBoard || card.textContent !== "❓") return;

    card.textContent = card.dataset.value;

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        matched += 2;
        firstCard.disabled = true;
        secondCard.disabled = true;

        firstCard = null;
        secondCard = null;
        lockBoard = false;

        if (matched === memoryValues.length) {
            document.getElementById("memoryResult").textContent =
                "🎉 ممتاز! وجدتي كل الصور";
        }
    } else {
        setTimeout(() => {
            firstCard.textContent = "❓";
            secondCard.textContent = "❓";
            firstCard = null;
            secondCard = null;
            lockBoard = false;
        }, 800);
    }
}

// صفحة اتصل بنا
function sendMessage() {
    const name = document.getElementById("contactName").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !subject || !message) {
        alert("يرجى ملء جميع الحقول");
        return;
    }

    const messages = JSON.parse(
        localStorage.getItem("fgMessages") || "[]"
    );

    messages.push({
        name: name,
        subject: subject,
        message: message
    });

    localStorage.setItem("fgMessages", JSON.stringify(messages));

    document.getElementById("contactResult").textContent =
        "تم حفظ رسالتك بنجاح";

    document.getElementById("contactName").value = "";
    document.getElementById("contactSubject").value = "";
    document.getElementById("contactMessage").value = "";
}

// بداية الموقع
function startWebsite() {
    const currentUser = sessionStorage.getItem("fgCurrentUser");

    if (currentUser) {
        document.getElementById("authPage").hidden = true;
        document.getElementById("website").hidden = false;
        showPage("home");
    } else {
        document.getElementById("authPage").hidden = false;
        document.getElementById("website").hidden = true;
        showLogin();
    }
}

startWebsite();
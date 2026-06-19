let dutyData = [];
let galleryData = [];
let currentPage = "page1";

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

const dutyRef = db.ref("dutyData");
const galleryRef = db.ref("galleryData");

dutyRef.on("value", (snapshot) => {
    dutyData = snapshot.val() ? Object.values(snapshot.val()) : [];

    // 🔥 render เฉพาะตอนอยู่หน้าสรุป
    if(currentPage === "page2"){
        showHistory();
    }
});

galleryRef.on("value", (snapshot) => {
    galleryData = snapshot.val() ? Object.values(snapshot.val()) : [];

    // 🔥 render เฉพาะตอนอยู่หน้าคลังรูป
    if(currentPage === "page3"){
        showGallery();
    }
});

const adminPassword = "KinsEn>2207";

if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark-mode");

}

showHistory();
showGallery();

function saveTime(){

    let name =
    document.getElementById("name").value;

    let start =
    document.getElementById("start").value;

    let end =
    document.getElementById("end").value;

    let proof =
    document.getElementById("proof").files[0];

    if(!name || !start || !end){
        alert("กรอกข้อมูลให้ครบ");
        return;
    }

    if(!proof){
        alert("กรุณาแนบรูป");
        return;
    }

    let startSplit = start.split(":");
    let endSplit = end.split(":");

    let startMinute =
    parseInt(startSplit[0]) * 60 +
    parseInt(startSplit[1]);

    let endMinute =
    parseInt(endSplit[0]) * 60 +
    parseInt(endSplit[1]);

    let totalMinute =
    endMinute - startMinute;

    if(totalMinute <= 0){
        alert("เวลาไม่ถูกต้อง");
        return;
    }

    let hour =
    Math.floor(totalMinute / 60);

    let minute =
    totalMinute % 60;

document.getElementById("result").innerHTML =
`
<h3>✅ บันทึกสำเร็จ</h3>

ชื่อ : ${name}<br><br>

เวลา :
${start} - ${end}<br><br>

รวมเวลา :
${hour} ชั่วโมง ${minute} นาที
`;

document.getElementById("result").style.display = "block";

let today =
new Date().toLocaleDateString("th-TH");

let alreadyExists =
dutyData.some(item =>
    item.name === name &&
    item.date === today
);

if(alreadyExists){

    document.getElementById("result").innerHTML =
    "<h3>❌ วันนี้ลงเวลาไปแล้ว</h3>";

    alert("❌ วันนี้ลงเวลาไปแล้ว");

    return;

}

let newData = {
    name:name,
    start:start,
    end:end,
    hour:hour,
    minute:minute,
    date:today
};

dutyRef.push(newData);

let reader = new FileReader();

reader.onload = function(){

    galleryData.push({
    name:name,
    date:today,
    image:reader.result
});

galleryRef.set(galleryData);

    showGallery();

};

reader.readAsDataURL(proof);

showHistory();

window.onload = function(){

    let btn =
    document.getElementById("themeBtn");

    if(!btn) return;

    if(document.body.classList.contains("dark-mode")){

        btn.innerHTML =
        "☀️ โหมดสว่าง";

    }else{

        btn.innerHTML =
        "🌙 โหมดมืด";

    }

}

document.getElementById("name").value = "";
document.getElementById("start").value = "";
document.getElementById("end").value = "";
document.getElementById("proof").value = "";

}

function showHistory(){

    let summary = {};

    (Object.values(dutyData || {})).forEach((item) => {

        let totalMinute =
        (item.hour * 60) + item.minute;

        if(summary[item.name]){
            summary[item.name] += totalMinute;
        }else{
            summary[item.name] = totalMinute;
        }

    });

    let html = "";

    for(let name in summary){

        let totalMinute = summary[name];

        let hour =
        Math.floor(totalMinute / 60);

        let minute =
        totalMinute % 60;

        html += `
     <div class="history-card">

<b>${name}</b><br>

รวม ${hour} ชั่วโมง ${minute} นาที

<br><br>

<button onclick="deletePerson('${name}')">
🗑️ ลบข้อมูล
</button>

</div>
`;
    }

    document.getElementById("history").innerHTML = html;

}

function showPage(page){

    currentPage = page; // ⭐ สำคัญมาก

    console.log("CLICK PAGE:", page);

    if(page === "page2" || page === "page3"){
        let password = prompt("กรอกรหัสแอดมิน");

        if(password !== adminPassword){
            alert("รหัสไม่ถูกต้อง");
            return;
        }
    }

    document.getElementById("page1").style.display = "none";
    document.getElementById("page2").style.display = "none";
    document.getElementById("page3").style.display = "none";

    document.getElementById(page).style.display = "block";

    if(page === "page2") showHistory();
    if(page === "page3") showGallery();
}

function deletePerson(name){

    let confirmDelete =
    confirm("ลบข้อมูลของ " + name + " ?");

    if(!confirmDelete){
        return;
    }

    dutyData =
    dutyData.filter(item =>
        item.name !== name
    );

    dutyRef.set(dutyData);

    showHistory();

}

function editPerson(){

    let oldName =
    prompt("ชื่อเดิมที่ต้องการแก้");

    if(!oldName){
        return;
    }

    let item = dutyData.find(
        x => x.name === oldName
    );

    if(!item){
        alert("ไม่พบชื่อนี้");
        return;
    }

    let newName =
    prompt("ชื่อใหม่", item.name);

    let newStart =
    prompt("เวลาเริ่มใหม่", item.start);

    let newEnd =
    prompt("เวลาสิ้นสุดใหม่", item.end);

    if(!newName || !newStart || !newEnd){
        return;
    }

    let startSplit = newStart.split(":");
    let endSplit = newEnd.split(":");

    let startMinute =
    parseInt(startSplit[0]) * 60 +
    parseInt(startSplit[1]);

    let endMinute =
    parseInt(endSplit[0]) * 60 +
    parseInt(endSplit[1]);

    let totalMinute =
    endMinute - startMinute;

    if(totalMinute <= 0){
        alert("เวลาไม่ถูกต้อง");
        return;
    }

    item.name = newName;
    item.start = newStart;
    item.end = newEnd;

    item.hour =
    Math.floor(totalMinute / 60);

    item.minute =
    totalMinute % 60;

    dutyRef.set(dutyData);

    showHistory();

    alert("แก้ไขสำเร็จ");

}

function clearAllData(){

    let confirmDelete =
    confirm("ต้องการลบข้อมูลทั้งหมดใช่หรือไม่?");

    if(!confirmDelete){
        return;
    }

    dutyRef.set([]);

    dutyData = [];

    showHistory();

    alert("ลบข้อมูลทั้งหมดแล้ว");

}

function saveImage(){

    let name =
    document.getElementById("name").value;

    let proof =
    document.getElementById("proof").files[0];

    if(!name){
        alert("กรุณากรอกชื่อ");
        return;
    }

    if(!proof){
        alert("กรุณาเลือกรูป");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(){

        let today =
        new Date().toLocaleDateString("th-TH");

        galleryRef.push({
    name,
    date: today,
    image: reader.result
     });

        showGallery();

        alert("📸 บันทึกรูปสำเร็จ");

    };

    reader.readAsDataURL(proof);

}

function showGallery(){

    let names = [];

    galleryData.forEach(item => {

        if(!names.includes(item.name)){
            names.push(item.name);
        }

    });

    let html = "";

    names.forEach(name => {

        html += `
     <div class="gallery-card">

        <b>👤 ${name}</b>

        <br><br>

        <button onclick="showPersonImages('${name}')">
         📂 ดูรูป
        </button>

        <button onclick="deletePersonImages('${name}')">
         🗑️ ลบรูปทั้งหมด
        </button>

        </div>
        `;
    });

    document.getElementById("gallery").innerHTML = html;

}

function showPersonImages(name){

    let html = `
    <h2>📸 รูปของ ${name}</h2>

    <button onclick="showGallery()">
    ⬅️ กลับ
    </button>
    <br><br>
    `;

    galleryData.forEach(item => {

        if(item.name === name){

            html += `
         <div class="person-image-card">


            📅 ${item.date}

            <br><br>

            <img
            src="${item.image}"
            style="
                width:100%;
                max-width:300px;
                border-radius:15px;
            ">

            </div>
            `;
        }

    });

    document.getElementById("gallery").innerHTML = html;

}

function clearGallery(){

    let confirmDelete =
    confirm("ต้องการลบรูปทั้งหมดใช่หรือไม่?");

    if(!confirmDelete){
        return;
    }

    galleryRef.set([]);

    galleryData = [];

    showGallery();

    alert("ลบรูปทั้งหมดแล้ว");

}

function deletePersonImages(name){

    let confirmDelete =
    confirm("ลบรูปทั้งหมดของ " + name + " ?");

    if(!confirmDelete){
        return;
    }

    galleryData =
    galleryData.filter(item =>
        item.name !== name
    );

    galleryRef.set(galleryData);

    showGallery();

    alert("ลบรูปของ " + name + " แล้ว");

}

function toggleTheme(){

    document.body.classList.toggle("dark-mode");

    let btn =
    document.getElementById("themeBtn");

    if(document.body.classList.contains("dark-mode")){

        btn.innerHTML =
        "☀️ โหมดสว่าง";

        localStorage.setItem(
            "theme",
            "dark"
        );

    }else{

        btn.innerHTML =
        "🌙 โหมดมืด";

        localStorage.setItem(
            "theme",
            "light"
        );

    }

}

window.showPage = showPage;

window.onload = function(){
    currentPage = "page1";
}
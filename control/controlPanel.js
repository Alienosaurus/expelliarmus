const {remote} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs');

const BrowserWindow = remote.BrowserWindow;
const BACKUPFILE = "backup.txt";
let hourglassWindow;

const schools = [
    {name: "Beauxbatons",
    color: "#6699FF", secondColor: "#003399",
    img: "../images/beauxbatons.png",
    points: 0, toAdd: 0},
    {name: "Durmstrang",
    color: "#1D2510", secondColor: "#690001",
    img: "../images/durmstrang.png",
    points: 0, toAdd: 0},
    {name: "Gryffondor",
    color: "#840C0C", secondColor: "#ff3333",
    img: "../images/gryffondor.png",
    points: 0, toAdd: 0},
    {name: "Poufsouffle",
    color: "#D8AC28", secondColor: "#141211",
    img: "../images/poufsouffle.png",
    points: 0, toAdd: 0},
    {name: "Serdaigle",
    color: "midnightblue", secondColor: "#003399",
    img: "../images/serdaigle.png",
    points: 0, toAdd: 0},
    {name: "Serpentard",
    color: "#229F45", secondColor: "#666967",
    img: "../images/serpentard.png",
    points: 0, toAdd: 0},
];

const dimensions = {
    width: 160,
    height: 280,

}
schools.forEach((school) => school.dimensions = dimensions);

Vue.component('school-controller', {
    props: ["school"],
    methods: {
        addPoints: function(){
            this.school.points += Number(this.school.toAdd);
            this.school.toAdd = 0;
            if(hourglassWindow != null){
                hourglassWindow.webContents.send('message', {type: "update", content: schools});
            }
            let pointsBackup = schools.map(function(school){return {"name": school.name, "points": school.points}});
            fs.writeFile(BACKUPFILE, JSON.stringify(pointsBackup), function(err) {
                if(err) {
                    return console.log(err);
                }
            }); 
        }
    },
    template: '<div class="school"><h2 v-bind:style="{ color: school.color}">{{school.name}}</h2>'+
        '<div class="currentPoints"><h3>Points : {{school.points}}</h3></div>'+
        '<div class="addingForm"> Ajouter des points :'+
            '<input v-model="school.toAdd" type="number" step="10" />'+
            '<button  v-on:click="addPoints" >Add points</button>'+
        '</div>'+
    '</div>'
});

Vue.component('dimension-control', {
    props: ["dimensions"],
    methods: {
        resize: function(){
            this.dimensions.width = Number(this.dimensions.width);
            this.dimensions.height = Number(this.dimensions.height);
            if(hourglassWindow != null){
                hourglassWindow.webContents.send('message', {type: "update", content: schools});
            }
        }
    },
    template: '<div class="dimensions">'+
        '<h1>Redimensionnement</h1>'+
        '<label>Width : <input v-model="dimensions.width" type="number" step="10" /></label>'+
        '<label>Height : <input v-model="dimensions.height" type="number" step="10" /></label>'+
        '<button  v-on:click="resize" >Resize</button>'+
    '</div>'

});

Vue.component('control-panel', {
  props: ["schools", "dimensions"],
  template: '<div>'+
        '<div class="schoolList"><school-controller v-for="school in schools"' +
        'v-bind:school="school" v-bind:key="school.name" /></div>'+
        '<dimension-control v-bind:dimensions="dimensions"/>'+
    '</div>'
});

const application = new Vue({
  el: '#app',
  data: {
    schools: schools,
    dimensions: dimensions
  }
});

function loadBackup(backupData){
    application.schools.forEach(function(school){
        backupData.forEach(function(backedSchool){
            if(school.name == backedSchool.name){
                school.points = backedSchool.points;
            }
        });
    });
}

if (fs.existsSync(BACKUPFILE)) {
    //if we have backup data, maybe load them
    if (confirm('Charger les données précédentes ?')) {
        let text = fs.readFileSync(BACKUPFILE,'utf8');
        let backupData = JSON.parse(text);
        loadBackup(backupData);
    } else {
        // Do nothing!
    }
}

hourglassWindow = new BrowserWindow({width: 900, height: 600});
hourglassWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../hourglass/index.html'),
    protocol: 'file:',
    slashes: true
}));
if(remote.getCurrentWindow().devMode){
    hourglassWindow.webContents.openDevTools();
}
hourglassWindow.webContents.on('did-finish-load', () => {
    hourglassWindow.webContents.send('message', {type: "init", content: schools});
});
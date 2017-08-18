const {remote} = require('electron')
const path = require('path')
const url = require('url')

const BrowserWindow = remote.BrowserWindow;

let hourglassWindow;

const schools = [
    {name: "Beauxbatons",
    color: "LightSkyBlue",
    points: 0, toAdd: 0},
    {name: "Durmstrang",
    color: "#132b16",
    points: 0, toAdd: 0},
    {name: "Gryffondor",
    color: "red",
    points: 0, toAdd: 0},
    {name: "Poufsouffle",
    color: "goldenrod",
    points: 0, toAdd: 0},
    {name: "Serdaigle",
    color: "MidnightBlue",
    points: 0, toAdd: 0},
    {name: "Serpentard",
    color: "Green",
    points: 0, toAdd: 0},
]

Vue.component('school-controller', {
    props: ["school"],
    methods: {
        addPoints: function(){
            this.school.points += Number(this.school.toAdd);
            this.school.toAdd = 0;
            if(hourglassWindow != null){
                hourglassWindow.webContents.send('message', {type: "update", content: schools});
            }
        }
    },
    template: '<div class="school"><h2 v-bind:style="{ color: school.color}">{{school.name}}</h2>'+
        '<div class="currentPoints"><h3>Points : {{school.points}}</h3></div>'+
        '<div class="addingForm"> Ajouter des points :'+
            '<input v-model="school.toAdd" type="number" step="10" />'+
            '<button  v-on:click="addPoints" >Add points</button>'+
        '</div>'+
    '</div>'
})
Vue.component('control-panel', {
  props: ["schools"],
  template: '<div><div class="schoolList"><school-controller v-for="school in schools"' +
      'v-bind:school="school" v-bind:key="school.name" /></div></div>'
})

const application = new Vue({
  el: '#app',
  data: {
    schools: schools
  }
});

hourglassWindow = new BrowserWindow({width: 900, height: 600});
hourglassWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../hourglass/index.html'),
    protocol: 'file:',
    slashes: true
  }))
hourglassWindow.webContents.openDevTools()
hourglassWindow.webContents.on('did-finish-load', () => {
    hourglassWindow.webContents.send('message', {type: "init", content: schools});
});
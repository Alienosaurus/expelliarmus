const ipc = require('electron').ipcRenderer;
let application;
const BASE_LIMIT = 500; //change this if the scale seems bad
let pointsLimit = BASE_LIMIT;

function drawHourglass(canvas, ctx){
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, 0);
    ctx.stroke();
}

function fillUpper(canvas, ctx, points){
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width/2, canvas.height / 2);
    ctx.fill();
}

function fillCanvas(canvas, points, color, secondColor){
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if(secondColor){
        var gradient = ctx.createLinearGradient(4*canvas.width/10, 0, 7*canvas.width/10, 8*canvas.height/10);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, secondColor);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = color;
    }

    fillUpper(canvas, ctx, points);
    ctx.beginPath();
    const relativeValue = (points / pointsLimit) * (canvas.height / 2)
    ctx.moveTo(0, canvas.height);
    let hourX = (relativeValue * canvas.width) / (canvas.height)
    ctx.lineTo(hourX, canvas.height - relativeValue);
    if((relativeValue != 0 && relativeValue != (canvas.height / 2))){
        ctx.lineTo(canvas.width / 2, canvas.height - relativeValue - 5);
    }
    ctx.lineTo(canvas.width - hourX, canvas.height - relativeValue);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
    //drawHourglass(canvas, ctx); //no longer need to draw hourglass since we have images
}

Vue.component('school-hourglass', {
    props: ["school"],
    methods: {

    },
    watch: {
        school: function(newVal, oldVal){
            //here do the repaint of hourglass
            const canvas = this.$refs.hourglassCanvas;
            const {color, secondColor} = this.school;
            if(newVal.points != oldVal.points){
                let inc = newVal.points > oldVal.points ? 1 : -1;
                let ptsTmp = oldVal.points;
                let augmenter = setInterval(function(){ 
                    if(ptsTmp != newVal.points){
                        ptsTmp += inc;
                        fillCanvas(canvas, ptsTmp, color, secondColor);
                    } else {
                        clearInterval(augmenter);
                    }
                }, 30);
                fillCanvas(this.$refs.hourglassCanvas, newVal.points, color, secondColor);
            } else {
                //still repaint once in case max size changed
                fillCanvas(canvas, newVal.points, color, secondColor);
            }
        }
    },
    mounted () {
        fillCanvas(this.$refs.hourglassCanvas, this.school.points, this.school.color, this.school.secondColor);
    },
    template: '<div class="school">'+
        '<div class="hourglass">'+
            '<canvas ref="hourglassCanvas"></canvas>'+
            '<img v-bind:src="school.img"/>'+
        '</div>'+
    '</div>'
})
Vue.component('hourglass-panel', {
  props: ["schools"],
  template: '<div><div class="schoolList"><school-hourglass v-for="school in schools"' +
      'v-bind:school="school" v-bind:key="school.name" /></div></div>'
})

ipc.on('message', (event, message) => {
    console.log(message);
    if(message.type == "init"){
        application = new Vue({
            el: '#app',
            data: {
                schools: message.content
            }
        });
    } else if (message.type == "update") {
        message.content.forEach(function(school){
            if(school.points >= pointsLimit){
                pointsLimit = BASE_LIMIT * (1 + Math.floor(school.points / BASE_LIMIT));
            }
        })
        application.schools = message.content;
    }
})
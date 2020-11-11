

//-------------------------------------SCENE------------------------------------------------//
import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)
camera.position.z = 5
let renderer = new THREE.WebGLRenderer()
let textMaterial
let textureLoader = new THREE.TextureLoader()
textureLoader.load('./assets/Environment.png',function(texture){
    let cubeTexture = (new THREE.WebGLCubeRenderTarget(500)).fromEquirectangularTexture(renderer,texture)
    textMaterial = new THREE.MeshStandardMaterial({color:0x114444, roughness:0, metalness:0.8})
    //material.envMap = cubeTexture.texture
    //material.needsUpdate = true
    scene.environment = cubeTexture.texture
    scene.background = texture
    //scene.environment = cubeTexture.texture
})
let width = window.innerWidth, height = window.innerHeight
if(height > width){
    camera.aspect = height/width  
    renderer.setSize(height,width)
}else{
    camera.aspect = width/height
    renderer.setSize(width,height)
}
camera.updateProjectionMatrix()
var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 2 );
scene.add( light );
document.body.appendChild(renderer.domElement)
window.addEventListener('resize',function(){
    width = window.innerWidth, height = window.innerHeight
    if(height > width){
        camera.aspect = height/width  
        renderer.setSize(height,width)
    }else{
        camera.aspect = width/height
        renderer.setSize(width,height)
    }
    camera.updateProjectionMatrix()
})

//---------------------------------------TEXT 3D--------------------------------------------//
let texts3D = {title:'',tryAgain:''}
let textStrings = {title:'Know the color ??', tryAgain:'Wanna try again ??'}
let fontLoader = new THREE.FontLoader()
fontLoader.setPath('https://unpkg.com/three@0.122.0/examples/fonts/')
fontLoader.load('gentilis_regular.typeface.json',function(font){
    for(let index in textStrings){
        let text3D = new THREE.TextGeometry(textStrings[index],{
            font:font,
            size:2,
            height:0.5
        })
        texts3D[index] = new THREE.Mesh(text3D,textMaterial)
        texts3D[index].name = index
        texts3D[index].position.set(-10,8,-10)
    }
    scene.add(texts3D.title)
})

play()

    
//-----------------------------EVENT TO FLIP CARD----------------------------------------//
let alternativePanels = document.getElementsByClassName('card')
for(let index = 0; alternativePanels.length > index; index++){
    alternativePanels[index].addEventListener('click',function(){
        let card = event.currentTarget
        card.children[0].classList.toggle('flipped')
        card.children[1].classList.toggle('flipped')
        scene.remove(texts3D.title)
        scene.add(texts3D.tryAgain)
        document.getElementsByClassName('choices')[0].classList.toggle('minimize')
        setTimeout(function(){
            document.getElementsByClassName('answers')[0].classList.toggle('minimize')
        },1500)
    })
}
document.getElementById('try-again').addEventListener('click', play)
function play(){
    document.getElementsByClassName('choices')[0].classList.toggle('minimize')
    document.getElementsByClassName('answers')[0].className = ('answers')
    if(scene.getObjectByName('tryAgain') != undefined){
        scene.add(texts3D.title)
        scene.remove(scene.getObjectByName('tryAgain'))
    }
    scene.remove(scene.getObjectByName('alternatives3D'))
    scene.remove(scene.getObjectByName('boxes3D'))
    scene.remove(scene.getObjectByName('cube'))
    
    //-------------------------------------COLOR BOX--------------------------------------------//
    let colors = [0xdddd00,0xdd0000,0x1d1d1d,0x7400a3,0x00dd00,0x0000dd,0x00fc92,0x813d00,0x00dddd,,0xff007b]
    let otherColors = [0xfc4600,0xc00024,0xeba000,0x7e7e7e]
    let colorIndex = Math.trunc(Math.random()*10)
    let answerColor = colors[colorIndex]
    let material = new THREE.MeshStandardMaterial({color: answerColor, metalness: 0.5, roughness:0})
    let geometry = new THREE.BoxGeometry()
    let cube = new THREE.Mesh(geometry,material)
    cube.name = 'cube'
    cube.position.y = 0.5
    scene.add(cube)
    
    //-------------------------------------COLOR BOXES------------------------------------------//
    let boxes = []
    let alternatives = []
    let alternatives3D = new THREE.Object3D()
    alternatives3D.name = "alternatives3D"
    colors[colorIndex] = 0xdddddd
    let answerPosition = Math.trunc(Math.random()*3)
    let positionX = -4
    for(let answers = 2; answers>=0; answers--){
        let alternative = {}
        colorIndex = Math.trunc(Math.random()*10)
        
        let boxMaterial = new THREE.MeshStandardMaterial({color: colors[colorIndex], metalness: 0.5, roughness:0})
        let boxGeometry = new THREE.BoxGeometry()
        if(answers == answerPosition){
            alternative.result = "Correct!"
            alternative.rgb = material.color
            alternatives.push(alternative)
            var box = new THREE.Mesh(boxGeometry,material)    
        }else{
            alternative.result = "Uncorrect!"
            alternative.rgb = boxMaterial.color
            alternatives.push(alternative)
            var box = new THREE.Mesh(boxGeometry,boxMaterial)
            colors[colorIndex] = otherColors[answers]
        }
        boxes.push(box)
        box.position.set(positionX,-2,0)
        box.scale.set(0.8, 0.8, 0.8)
        positionX += 4
        alternatives3D.add(box)
    }
    scene.add(alternatives3D)
    
    //-----------------------------------PRINT COLORS ALTERNATIVES------------------------------//
    let alternativePanels = document.getElementsByClassName('card')
    for(let index = 0; alternativePanels.length > index; index++){
        let correct = alternatives[index].result.toLowerCase().replace('!','')
        alternativePanels[index].innerHTML = 
        '<div class="answer ' + correct + ' flipped"><span class="' + correct + '">' + alternatives[index].result + '</span></div>' +
        '<div class="answer-bg"><div class="rgb">' +
        '<span class="r"> r: ' + alternatives[index].rgb.r + '</span>' +
        '<span class="g"> g: ' + alternatives[index].rgb.g + '</span>' +
        '<span class="b"> b: ' + alternatives[index].rgb.b + '</span>' +
        '</div></div>'
    }
    
    //--------------------------------------PRINT REST COLORS-----------------------------------//
    let boxes3D = new THREE.Object3D()
    boxes3D.name = 'boxes3D'
    colors.forEach((color,index) => {
        let boxMaterial = new THREE.MeshStandardMaterial({color: color, metalness: 0.5, roughness:0})
        let boxGeometry = new THREE.BoxGeometry()
        let box = new THREE.Mesh(boxGeometry,boxMaterial)
        box.position.set(index - 5,2.2,0)
        box.scale.set(0.3, 0.3, 0.3)
        boxes3D.add(box)
    })
    scene.add(boxes3D)
    
    let rotations = [[0.01,-0.01],[-0.01,-0.01],[-0.01,0.01]]
    var animate = function () {
        requestAnimationFrame( animate );
        boxes3D.rotation.y += 0.01;
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        boxes.forEach((box,index) => {
            box.rotation.x += rotations[index][0]
            box.rotation.y += rotations[index][1]
        });

        renderer.render( scene, camera );
    };

    animate();
}


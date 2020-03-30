const Engine = Matter.Engine;
const Render = CustomRenderer;
const Bodies = Matter.Bodies;
const World = Matter.World;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
const Runner = Matter.Runner;

const borderWidth = 100;
const borderHalfWidth = 50;
const socialModels = [{
  size: 100,
  text: 'Facebook',
}, {
  size: 120,
  text: 'Instagram',
}, {
  size: 70,
  text: 'OK',
}, {
  size: 100,
  text: 'VK',
}, {
  size: 100,
  text: 'YouTube',
}];

const container = document.querySelector('.js-scene-container');
const canvas = document.createElement('canvas');
container.appendChild(canvas);

let sceneWidth = null;
let sceneHalfWidth = null;
let sceneHeight = null;

let world = null;
let engine = null;
let render = null;
let runner = null;
let mouse = null;
let mouseConstraint = null;

let resetTimeoutId = null;

updateSceneSize();
initComponent();
window.addEventListener('resize', () => {
  if (!resetTimeoutId) resetComponent();

  clearTimeout(resetTimeoutId);
  resetTimeoutId = setTimeout(() => {
    updateSceneSize();
    initComponent();
    resetTimeoutId = null;
  }, 1000);
});

function initComponent() {
  runner = Runner.create();
  engine = Engine.create();
  render = Render.create({
    element: container,
    canvas, engine,
    options: {
      width: sceneWidth,
      height: sceneHeight,
      background: '#6001d9',
      showAngleIndicator: false,
      wireframes: false,
    },
  });

  Render.run(render);
  Runner.run(runner, engine);

  world = engine.world;
  world.gravity = {
    scale: 0.003,
    x: 0, y: 1,
  };

  const ground = Bodies.rectangle(sceneHalfWidth, sceneHeight + borderHalfWidth, sceneWidth, borderWidth, {
    isStatic: true,
    density: 1,
  });
  const rightWall = Bodies.rectangle(sceneWidth + borderHalfWidth, 0, borderWidth, sceneHeight * 3, {
    isStatic: true,
    density: 1,
  });
  const leftWall = Bodies.rectangle(-borderHalfWidth, 0, borderWidth, sceneHeight * 3, {
    isStatic: true,
    density: 1,
  });
  const elements = socialModels.map(elem => {
    const x = getRandomNumber(sceneHalfWidth - 20, sceneHalfWidth + 20);
    const y = getRandomNumber(-500, -700);

    return Bodies.circle(x, y, elem.size, {
      restitution: 0.35,
      friction: 0.5,
      frictionAir: 0.06,
      density: 1,
      render: {
        fillStyle: '#fff',
        text: {
          content: elem.text,
          fontFamily: 'Inter',
          fontSize: 28,
          color: '#6001d9',
        },
      },
    });
  });

  World.add(world, [...elements, ground, leftWall, rightWall]);

  mouse = Mouse.create(render.canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.1,
      render: {
        visible: false,
      },
    },
  });

  World.add(world, mouseConstraint);
  render.mouse = mouse;

  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: sceneWidth, y: sceneHeight },
  });
}

function resetComponent() {
  world && World.clear(world);
  engine && Engine.clear(engine);
  runner && Runner.stop(runner);
  mouse && Mouse.clearSourceEvents(mouse);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      render && Render.stop(render);
      render = null;
    });
  });

  world = null;
  engine = null;
  runner = null;
  mouse = null;
}

function updateSceneSize() {
  sceneWidth = container.clientWidth;
  sceneHalfWidth = sceneWidth / 2;
  sceneHeight = container.clientHeight;
}

function getRandomNumber(min = -Infinity, max = Infinity) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}

const Engine = Matter.Engine;
const Render = CustomRenderer;
const Body = Matter.Body;
const Bodies = Matter.Bodies;
const World = Matter.World;
const Runner = Matter.Runner;

const elementModels = [{
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

let engine = null;
let render = null;
let runner = null;

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

  const elements = elementModels.map(elem => {
    const x = getRandomNumber(sceneHalfWidth - 20, sceneHalfWidth + 20);
    const y = getRandomNumber(-500, -700);

    return Bodies.circle(x, y, elem.size, {
      restitution: 0.35,
      friction: 1,
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

  const ground = Bodies.rectangle(sceneWidth / 2, sceneHeight + 5, sceneWidth, 10, { isStatic: true });
  const leftWall = Bodies.rectangle(-5, 0, 10, sceneHeight * 3, { isStatic: true });
  const rightWall = Bodies.rectangle(sceneWidth + 5, 0, 10, sceneHeight * 3, { isStatic: true });

  World.add(engine.world, [...elements, ground, leftWall, rightWall]);
  runner = Engine.run(engine);
  Render.run(render);
}

function resetComponent() {
  World.clear(engine.world);
  Engine.clear(engine);
  Runner.stop(runner);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Render.stop(render);
      render = null;
    });
  });

  engine = null;
  runner = null;
}

function updateSceneSize() {
  sceneWidth = container.clientWidth;
  sceneHalfWidth = sceneWidth / 2;
  sceneHeight = container.clientHeight;
}

function getRandomNumber(min = -Infinity, max = Infinity) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}

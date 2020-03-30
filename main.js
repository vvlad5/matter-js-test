const Engine = Matter.Engine;
const Render = CustomRenderer;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const World = Matter.World;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
const Query = Matter.Query;
const Events = Matter.Events;
const Runner = Matter.Runner;

const borderSize = 100;
const borderHalfSize = 50;
const socialModels = [{
  size: 100,
  text: 'Facebook',
  url: 'https://facebook.com',
}, {
  size: 120,
  text: 'Instagram',
  url: 'https://instagram.com',
}, {
  size: 70,
  text: 'OK',
  url: 'https://ok.ru',
}, {
  size: 100,
  text: 'VK',
  url: 'https://vk.com',
}, {
  size: 100,
  text: 'YouTube',
  url: 'https://youtube.com',
}];

const container = document.querySelector('.js-scene-container');
const canvas = document.createElement('canvas');
container.appendChild(canvas);

let sceneWidth = null;
let sceneHalfWidth = null;
let sceneHeight = null;
let sceneHalfHeight = null;

let world = null;
let engine = null;
let render = null;
let runner = null;
let mouse = null;
let mouseConstraint = null;

let resetTimeoutId = null;
let isMouseDown = null;

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
    scale: 0.002,
    x: 0, y: 1,
  };

  const ground = (function() {
    const xPos = sceneHalfWidth;
    const yPos = sceneHeight + borderHalfSize;
    const width = sceneWidth;
    const height = borderSize;

    return Bodies.rectangle(xPos, yPos, width, height, {
      isStatic: true,
      density: 1,
    });
  })();
  const leftWall = (function() {
    const xPos = -borderHalfSize;
    const yPos = -sceneHalfHeight - borderHalfSize;
    const width = borderSize;
    const height = sceneHeight * 3;

    return Bodies.rectangle(xPos, yPos, width, height, {
      isStatic: true,
      density: 1,
    });
  })();
  const rightWall = (function() {
    const xPos = sceneWidth + borderHalfSize;
    const yPos = -sceneHalfHeight - borderHalfSize;
    const width = borderSize;
    const height = sceneHeight * 3;

    return Bodies.rectangle(xPos, yPos, width, height, {
      isStatic: true,
      density: 1,
    });
  })();
  const ceiling = (function() {
    const xPos = sceneHalfWidth;
    const yPos = -sceneHeight * 2 - borderHalfSize;
    const width = sceneWidth;
    const height = borderSize;

    return Bodies.rectangle(xPos, yPos, width, height, {
      isStatic: true,
      density: 1,
    });
  })();

  World.add(world, [ground, leftWall, rightWall, ceiling]);

  socialModels.forEach((elem, i) => {
    const xPos = getRandomNumber(sceneHalfWidth - 100, sceneHalfWidth + 100);
    const yPos = getRandomNumber(-sceneHalfHeight, -sceneHeight);
    const body = Bodies.circle(xPos, yPos, elem.size, {
      restitution: 0.35,
      frictionAir: 0.045,
      friction: 0.55,
      density: 1,
      url: elem.url,
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

    setTimeout(() => {
      World.addBody(world, body);
    }, 350 * i);
  });

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

  Events.on(mouseConstraint, 'mousedown', onMouseDown);

  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: sceneWidth, y: sceneHeight },
  });
}

function resetComponent() {
  Events.off(mouseConstraint);
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
  mouseConstraint = null;
}

function onMouseDown({ mouse: { button } }) {
  if (isMouseDown || button !== 0) return isMouseDown = false;
  isMouseDown = true;

  Events.on(mouseConstraint, 'mouseup', onMouseUp);
  setTimeout(() => {
    Events.off(mouseConstraint, 'mouseup', onMouseUp);
  }, 150);
}

function onMouseUp({ mouse }) {
  isMouseDown = false;

  const elemFromPoint = Query.point(world.bodies, mouse.position)[0];
  if (!elemFromPoint) return null;

  Events.off(mouseConstraint, 'mouseup', onMouseUp);
  window.open(elemFromPoint.url, '_blank');
}

function updateSceneSize() {
  sceneWidth = container.clientWidth;
  sceneHalfWidth = sceneWidth / 2;
  sceneHeight = container.clientHeight;
  sceneHalfHeight = sceneHeight / 2;
}

function getRandomNumber(min = -Infinity, max = Infinity) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}

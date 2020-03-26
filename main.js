const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

const elementsModel = [
  {
    size: 100,
  }, {
    size: 120,
  }, {
    size: 70,
  }, {
    size: 100
  }, {
    size: 100
  }
];

const engine = Engine.create();

const elements = elementsModel.map(elem => {
  const x = getRandomNumber(240, 280);
  const y = getRandomNumber(-500, -700);

  return Bodies.circle(x, y, elem.size, {
    restitution: 0.35,
    friction: 1,
    density: 1,
  });
});
const ground = Bodies.rectangle(250, 905, 500, 10, {isStatic: true});
const leftWall = Bodies.rectangle(-5, 0, 10, 2700, {isStatic: true});
const rightWall = Bodies.rectangle(505, 0, 10, 2700, {isStatic: true});

World.add(engine.world, [...elements, ground, leftWall, rightWall]);
Engine.run(engine);
customRender();

function customRender() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.style.cssText = `
    margin-left: 50%;
    transform: translateX(-50%);
  `;
  canvas.width = 500;
  canvas.height = 900;

  document.body.appendChild(canvas);
  const bodies = Composite.allBodies(engine.world);

  requestAnimationFrame(function render() {
    context.save();
    context.fillStyle = '#6001d9';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    context.fillStyle = '#fff';
    context.beginPath();

    for (let i = 0; i < bodies.length; i += 1) {
      let vertices = bodies[i].vertices;

      context.moveTo(vertices[0].x, vertices[0].y);

      for (let j = 1; j < vertices.length; j += 1) {
        context.lineTo(vertices[j].x, vertices[j].y);
      }

      context.lineTo(vertices[0].x, vertices[0].y);
    }

    context.lineWidth = 1;
    context.stroke();
    context.fill();

    window.requestAnimationFrame(render);
  });
}

function getRandomNumber(min = -Infinity, max = Infinity) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}
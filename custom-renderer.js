const CustomRenderer = Matter.Render;

CustomRenderer.bodies = (render, bodies, context) => {
  const c = context;
  const engine = render.engine;
  const options = render.options;
  const showInternalEdges = options.showInternalEdges || !options.wireframes;

  let body = null;
  let part = null;
  let i, k;

  for (i = 0; i < bodies.length; i++) {
    body = bodies[i];

    if (!body.render.visible) continue;

    for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
      part = body.parts[k];

      if (!part.render.visible) continue;

      if (options.showSleeping && body.isSleeping) {
        c.globalAlpha = 0.5 * part.render.opacity;
      } else if (part.render.opacity !== 1) {
        c.globalAlpha = part.render.opacity;
      }

      if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
        const sprite = part.render.sprite;
        const texture = _getTexture(render, sprite.texture);

        c.translate(part.position.x, part.position.y);
        c.rotate(part.angle);

        c.drawImage(
          texture.width * -sprite.xOffset * sprite.xScale,
          texture.height * -sprite.yOffset * sprite.yScale,
          texture.width * sprite.xScale,
          texture.height * sprite.yScale,
          texture,
        );

        c.rotate(-part.angle);
        c.translate(-part.position.x, -part.position.y);
      } else {
        if (part.circleRadius) {
          c.beginPath();
          c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
        } else {
          c.beginPath();
          c.moveTo(part.vertices[0].x, part.vertices[0].y);

          for (let j = 1; j < part.vertices.length; j++) {
            if (!part.vertices[j - 1].isInternal || showInternalEdges) {
              c.lineTo(part.vertices[j].x, part.vertices[j].y);
            } else {
              c.moveTo(part.vertices[j].x, part.vertices[j].y);
            }

            if (part.vertices[j].isInternal && !showInternalEdges) {
              c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
            }
          }

          c.lineTo(part.vertices[0].x, part.vertices[0].y);
          c.closePath();
        }

        if (!options.wireframes) {
          c.fillStyle = part.render.fillStyle;

          if (part.render.lineWidth) {
            c.lineWidth = part.render.lineWidth;
            c.strokeStyle = part.render.strokeStyle;
            c.stroke();
          }

          c.fill();
        } else {
          c.lineWidth = 1;
          c.strokeStyle = '#bbb';
          c.stroke();
        }
      }

      c.globalAlpha = 1;

      if (part.render.text) {
        let fontSize = 30;
        let fontFamily = part.render.text.fontFamily || 'Arial';
        let color = part.render.text.color || '#000';

        if (part.render.text.fontSize) fontSize = part.render.text.fontSize;
        else if (part.circleRadius) fontSize = part.circleRadius / 2;

        let content = '';
        if (typeof part.render.text == 'string') content = part.render.text;
        else if (part.render.text.content) content = part.render.text.content;

        c.font = fontSize + 'px ' + fontFamily;
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillStyle = color;

        c.translate(part.position.x, part.position.y);
        c.rotate(part.angle);
        c.fillText(content, 0, 0);
        c.rotate(-part.angle);
        c.translate(-part.position.x, -part.position.y);
      }
    }
  }
};

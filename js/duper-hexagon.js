(function ()
{
	"use strict";

	var SIZE_X = 800;
	var SIZE_Y = 600;
	var ROTATION_SPEED = 0.01;
	var PLAYER_RAIL_SIDES = 6;
	var PLAYER_RADIUS = 10;
	var CENTER_RADIUS = 40;
	var CENTER_BORDER = 20;
	var PLAYER_SPEED = Math.PI / 60;
	var BGCOLOR1 = 0x663366;
	var BGCOLOR2 = 0x442244;

	var sqrt3 = Math.sqrt(3);
	var player_position = 3 * Math.PI / 2;

	var intervals;

	var setUpPlayerRail = function ()
	{
		intervals = [0];
		var interval = 2 * Math.PI / PLAYER_RAIL_SIDES;
		for (var i = 1; i <= PLAYER_RAIL_SIDES; i++)
		{
			intervals.push(i * interval);
		}

		player_poly = buildRegularPolygon(0, CENTER_RADIUS + CENTER_BORDER, 3, PLAYER_RADIUS, Math.PI / 2);
		player_graphics.beginFill(0xFF66ff);
		player_graphics.drawPolygon(player_poly);
		player_graphics.endFill();
	};

	var backgroundTriangles = function ()
	{
		var points = [];
		// A background triangle's height, must be enough to reach from the center to any of the four corners
		var h = Math.sqrt(SIZE_X * SIZE_X + SIZE_Y * SIZE_Y);
		var l = h * sqrt3 / 2; // Side of an equilateral triangle with height h
		var zero = new Phaser.Point(0, 0);
		points.push(new Phaser.Point(l, 0));
		points.push(new Phaser.Point(l / 2, h));
		points.push(new Phaser.Point(-l / 2, h));
		points.push(new Phaser.Point(-l, 0));
		points.push(new Phaser.Point(-l / 2, -h));
		points.push(new Phaser.Point(l / 2, -h));
		points.push(points[0]);

		var triangles = [];
		for (var i = 0; i < 6; i++)
		{
			triangles.push(new Phaser.Polygon([points[i], points[i + 1], zero]));
		}
		return triangles;
	};

	var redrawPlayerPos = function ()
	{
		var index = null;
		for (var i = 0; i < intervals.length - 1 && index === null; i++)
		{
			if (player_position < intervals[i + 1])
			{
				index = i;
			}
		}
		player_graphics.rotation = player_position;
	};

	var polygonPoints = function (x, y, sides, radius, angle)
	{
		var x_points = [];
		var y_points = [];
		angle = angle === undefined ? 0 : angle;
		var height = sqrt3 * radius / 2;
		// Avoid expensive sine and cosine calculations for the center hexagon
		if (sides === 6 && angle === 0)
		{
			x_points = [x + radius, x + radius / 2, x - radius / 2, x - radius, x - radius / 2, x + radius / 2];
			y_points = [y, y + height, y + height, y, y - height, y - height];
		} else
		{
			var increment = 2 * Math.PI / sides;
			for (var i = 0; i < sides; i++)
			{
				var curr_angle = increment * i + angle;
				x_points.push(x + Math.cos(curr_angle) * radius);
				y_points.push(y + Math.sin(curr_angle) * radius);
			}
		}
		return {
			x: x_points,
			y: y_points
		};
	};
	var buildRegularPolygon = function (x, y, sides, radius, angle)
	{
		var coords = polygonPoints(x, y, sides, radius, angle);
		var points = [];
		for (var i = 0; i < sides; i++)
		{
			points.push(new Phaser.Point(coords.x[i], coords.y[i]));
		}
		return new Phaser.Polygon(points);
	};

	var increasePlayerPos = function (offset)
	{
		player_position += offset;
		if (player_position < 0)
		{
			player_position += 2 * Math.PI;
		} else if (player_position > 2 * Math.PI)
		{
			player_position -= 2 * Math.PI;
		}
	};

	var background_graphics_odd;
	var background_graphics_even;
	var center_hexagon_graphics;
	var center_hexagon_poly;
	var player_graphics;
	var player_poly;
	var cursors;
	var song;

	var DuperHexagon = {
		preload: function ()
		{
			game.load.audio('pixel_world', ['assets/music/pixel_world_lo.ogg', 'assets/music/pixel_world_lo.mp3']);
		},
		create: function ()
		{
			song = game.add.audio('pixel_world');
			song.loop = true;
			song.play();

			// Do not stop when the window loses focus
			game.stage.disableVisibilityChange = true;
			game.world.setBounds(-SIZE_X / 2, -SIZE_Y / 2, SIZE_X / 2, SIZE_Y / 2);

			var bg_polygons = backgroundTriangles();
			background_graphics_odd = game.add.graphics(0, 0);
			background_graphics_even = game.add.graphics(0, 0);
			background_graphics_odd.beginFill(BGCOLOR1);
			background_graphics_even.beginFill(BGCOLOR2);
			for (var i = 0; i < bg_polygons.length; i++)
			{
				var graphics = i % 2 === 0 ? background_graphics_even : background_graphics_odd;
				graphics.drawPolygon(bg_polygons[i]);
			}
			background_graphics_odd.endFill();
			background_graphics_even.endFill();

			center_hexagon_graphics = game.add.graphics(0, 0);
			center_hexagon_poly = buildRegularPolygon(0, 0, PLAYER_RAIL_SIDES, CENTER_RADIUS);
			center_hexagon_graphics.beginFill(0xFF33ff);
			center_hexagon_graphics.drawPolygon(center_hexagon_poly);
			center_hexagon_graphics.endFill();

			player_graphics = game.add.graphics(0, 0);
			setUpPlayerRail();
			redrawPlayerPos();

			cursors = game.input.keyboard.createCursorKeys();
		},
		update: function ()
		{
			game.world.rotation += ROTATION_SPEED;
			if (cursors.left.isDown)
			{
				increasePlayerPos(-PLAYER_SPEED);
				redrawPlayerPos();
			}
			else if (cursors.right.isDown)
			{
				increasePlayerPos(PLAYER_SPEED);
				redrawPlayerPos();
			}
		}
	};

	var game = new Phaser.Game(SIZE_X, SIZE_Y, Phaser.AUTO, '', DuperHexagon);
})();
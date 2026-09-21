"""
CodeForMe Kids game toolkit.  Use it with:

    from game import *

Draw:   clear(color)  rect(x, y, w, h, color)  circle(x, y, r, color)
        line(x1, y1, x2, y2, color)  text(x, y, "hi", color, size)  robot_face(x, y, size)
Input:  key_down("ArrowLeft")
Loop:   on_tick(my_function)   -> runs my_function about 30 times a second
Extras: random_int(1, 10)  distance(x1, y1, x2, y2)  WIDTH  HEIGHT
"""
import js
import math
import random

_canvas = js.document.getElementById("stage-canvas")
_ctx = _canvas.getContext("2d")

WIDTH = _canvas.width
HEIGHT = _canvas.height

_tick_callback = None
_tick_hz = 30


def clear(color="#ffffff"):
    _ctx.fillStyle = color
    _ctx.fillRect(0, 0, WIDTH, HEIGHT)


def rect(x, y, w, h, color="#7497af", fill=True):
    if fill:
        _ctx.fillStyle = color
        _ctx.fillRect(x, y, w, h)
    else:
        _ctx.strokeStyle = color
        _ctx.strokeRect(x, y, w, h)


def circle(x, y, r, color="#7497af", fill=True):
    _ctx.beginPath()
    _ctx.arc(x, y, r, 0, 6.283185307179586)
    if fill:
        _ctx.fillStyle = color
        _ctx.fill()
    else:
        _ctx.strokeStyle = color
        _ctx.stroke()


def line(x1, y1, x2, y2, color="#24313d", width=3):
    _ctx.strokeStyle = color
    _ctx.lineWidth = width
    _ctx.beginPath()
    _ctx.moveTo(x1, y1)
    _ctx.lineTo(x2, y2)
    _ctx.stroke()


def text(x, y, s, color="#24313d", size=18):
    _ctx.fillStyle = color
    _ctx.font = f"700 {size}px Nunito, sans-serif"
    _ctx.textAlign = "left"
    _ctx.fillText(str(s), x, y)


def robot_face(x, y, size=60):
    """Draw YOUR robot (from the My Robot button) centered at x, y."""
    js.window.__drawRobot(_ctx, x, y, size)


def key_down(key):
    """True while `key` is held, e.g. 'ArrowLeft', 'ArrowUp', 'a', ' '."""
    try:
        return bool(js.window.__keys.has(key))
    except Exception:
        return False


def random_int(a, b):
    return random.randint(a, b)


def distance(x1, y1, x2, y2):
    return math.hypot(x2 - x1, y2 - y1)


def on_tick(func, hz=30):
    global _tick_callback, _tick_hz
    _tick_callback = func
    _tick_hz = hz


def stop():
    global _tick_callback
    _tick_callback = None


def _dispatch_tick():
    if _tick_callback:
        _tick_callback()


def _has_tick():
    return _tick_callback is not None


def _tick_interval_ms():
    return int(1000 / max(1, _tick_hz))

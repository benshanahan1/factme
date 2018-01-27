#!/usr/bin/python

import MySQLdb
from flask import Flask
from config.config import IP, PORT
from json import dumps, loads
from flask import Flask, request, abort
from flask_restful import Resource, Api
from flask_cors import CORS
from lib.database import Database
from gevent.wsgi import WSGIServer
app = Flask(__name__)

@app.route("/")
def index():
    abort(404, "Nothing to see!")


if __name__ == "__main__":
    http_server = WSGIServer((IP, PORT), app)
    http_server.serve_forever()
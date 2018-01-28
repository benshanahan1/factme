"""
Database Class

Establish MySQL database connection and provide useful functions.

27 January 2018, Benjamin Shanahan
"""

import MySQLdb
import configparser
import json
from datetime import datetime
from flask import request, abort

TIME_FORMAT = "%c"

class Database(object):
    def __init__(self):
        cfg = configparser.ConfigParser()
        cfg.read("config/db.keys")  # parse .keys file in config/ dir
        self.host = cfg.get("Database","host")
        self.user = cfg.get("Database","user")
        self.db   = cfg.get("Database","database")
        self.conn = MySQLdb.connect(
            host   = self.host,
            user   = self.user,
            passwd = cfg.get("Database","password"),
            db     = self.db)

    # Query database and fetch all (by default)
    def query(self, q, vals=None):
        if False: print("QUERY:", q)  # debug
        self.conn.ping(True)  # refresh connection if time-out
        # Get cursor to execute SQL queries. The cursor should be a Dictionary
        # so that it's easier for us to work with.
        cur = self.conn.cursor(MySQLdb.cursors.DictCursor)
        if vals is None:
            cur.execute(q)
        else:
            cur.execute(q, vals)  # escape values to prevent SQL injection
        self.conn.commit()  # save inserted data into database
        rows = cur.fetchall()
        cur.close()
        return rows

    # Check if userid exists in users table
    def user_exists(self, userid=None):
        r = self.query("SELECT userid FROM users WHERE userid=%s", (userid,))
        return len(r) is not 0

    # Check if factid exists in facts table
    def fact_exists(self, factid=None):
        r = self.query("SELECT id FROM facts WHERE id=%s", (factid,))
        return len(r) is not 0

    # Retrieve user details given their userid
    def get_user_details(self, userid=None):
        r = self.query("SELECT * FROM users WHERE userid=%s", (userid,))
        try:
            return r[0]
        except MySQLdb.Error as e:
            abort(400, "get_user_details: {}".format(e.args[1]))

    # Return a list of column names for the specified table.
    def get_columns(self, table):
        try:
            rv = self.query(
                """
                SELECT `COLUMN_NAME` 
                FROM `INFORMATION_SCHEMA`.`COLUMNS` 
                WHERE `TABLE_SCHEMA`='{}' 
                    AND `TABLE_NAME`='{}';
                """.format(self.db, table))
            return [item["COLUMN_NAME"] for item in rv]
        except MySQLdb.Error as e:
            abort(404, "get_columns: {}".format(e.args[1]))

    # Insert a new fact
    def add_fact(self, userid, highlight, replacement, url, description):
        try:
            self.query(
                """
                INSERT INTO facts (`userid`, `highlight`, `replacement`, `url`, `description`)
                VALUES ('{}', '{}', '{}', '{}', '{}');
                """.format(userid, highlight, replacement, url, description))
        except MySQLdb.Error as e:
            abort(400, "add_fact: {}".format(e.args[1]))

    # Update an existing fact
    def update_fact(self, factid, column_name, value):
        try:
            self.query(
                """
                UPDATE facts
                SET `{}`='{}'
                WHERE id='{}'
                """.format(column_name, value, factid))
        except MySQLdb.Error as e:
            abort(400, "update_fact: {}".format(e.args[1]))

    # Return list of all facts posted by userid
    def get_user_facts(self, userid):
        try:
            rv = self.query(
                """
                SELECT *
                FROM facts
                WHERE userid='{}'
                """.format(userid))
            for i in range(len(rv)):
                rv[i]["timestamp"] = datetime.strftime(rv[i]["timestamp"], TIME_FORMAT)
            return rv
        except MySQLdb.Error as e:
            abort(400, "get_user_facts: {}".format(e.args[1]))

    # Return a fact by factid
    def get_fact(self, factid):
        try:
            rv = self.query(
                """
                SELECT *
                FROM facts
                WHERE id='{}'
                """.format(factid))
            rv = rv[0]
            rv["timestamp"] = datetime.strftime(rv["timestamp"], TIME_FORMAT)
            return rv
        except MySQLdb.Error as e:
            abort(400, "get_fact: {}".format(factid))
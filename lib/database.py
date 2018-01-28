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

    # Check if factid exists in facts table
    def fact_exists(self, factid=None):
        r = self.query("SELECT id FROM facts WHERE id=%s", (factid,))
        return len(r) is not 0

    # Increment user's facts_posted stat
    def user_increment_facts_posted(self, userid):
        try:
            self.query(
                """
                UPDATE users
                SET facts_posted=facts_posted+1
                WHERE userid='{}'
                """.format(userid))
        except MySQLdb.Error as e:
            abort(400, "user_increment_facts_posted: {}".format(e.args[1]))

    # Decrement user's facts_posted stat
    def user_decrement_facts_posted(self, userid):
        try:
            self.query(
                """
                UPDATE users
                SET facts_posted=facts_posted-1
                WHERE userid='{}'
                """.format(userid))
        except MySQLdb.Error as e:
            abort(400, "user_decrement_facts_posted: {}".format(e.args[1]))

    # Insert a new fact into facts table
    def add_fact(self, userid, highlight, replacement, description):
        try:
            self.query(
                """
                INSERT INTO facts (`userid`, `highlight`, `replacement`, `description`)
                VALUES ('{}', '{}', '{}', '{}');
                """.format(userid, highlight, replacement, description))
            self.user_increment_facts_posted(userid)
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
            abort(400, "get_fact: {}".format(e.args[1]))

    # Get poster (userid) of fact
    def get_poster(self, factid):
        try:
            rv = self.query(
                """
                SELECT userid
                FROM facts
                WHERE id='{}'
                """.format(factid))
            return None if not rv else rv[0]["userid"]
        except MySQLdb.Error as e:
            abort(400, "get_poster: {}".format(e.args[1]))

    # Delete a fact and its associated votes. Decrement user's facts_posted 
    # statistic.
    def delete_fact(self, factid):
        try:
            userid = self.get_poster(factid)
            self.query(
                """
                DELETE FROM facts
                WHERE id='{}'
                """.format(factid))
            self.query(
                """
                DELETE FROM votes
                WHERE factid='{}'
                """.format(factid))
            self.user_decrement_facts_posted(userid)
            return True
        except MySQLdb.Error as e:
            abort(400, "delete_fact: {}".format(e.args[1]))

    # Check if a userid has voted on a factid. If not, return None, otherwise 
    # return the value of the vote (+! or -1).
    def get_vote(self, userid, factid):
        try:
            rv = self.query(
                """
                SELECT value
                FROM votes
                WHERE userid='{}' AND factid='{}'
                """.format(userid, factid))
            return None if not rv else rv[0]["value"]
        except MySQLdb.Error as e:
            abort(400, "get_vote: {}".format(e.args[1]))

    # Insert vote into votes table
    def add_vote(self, userid, factid, vote):
        try:
            self.query(
                """
                INSERT INTO votes (`factid`, `userid`, `value`)
                VALUES ('{}', '{}', '{}')
                """.format(factid, userid, vote))
        except MySQLdb.Error as e:
            abort(400, "add_vote: {}".format(e.args[1]))        

    # Retrieve number of total votes (upvotes + downvotes) for a factid
    def get_vote_count(self, factid):
        try:
            rv = self.query(
                """
                SELECT value
                FROM votes
                WHERE factid='{}'
                """.format(factid))
            if not rv:
                return 0
            else:
                return sum([item["value"] for item in rv])
        except MySQLdb.Error as e:
            abort(400, "get_vote_count: {}".format(e.args[1]))

    # Update vote value in votes table corresponding to factid and userid
    def update_vote(self, userid, factid, vote):
        try:
            self.query(
                """
                UPDATE votes
                SET value='{}'
                WHERE factid='{}' AND userid='{}'
                """.format(vote, factid, userid)
                )
        except MySQLdb.Error as e:
            abort(400, "update_vote: {}".format(e.args[1]))

    # Add upvote
    def upvote(self, userid, factid):
        vote = self.get_vote(userid, factid)
        if vote is None:
            self.add_vote(userid, factid, 1)
        elif vote == -1:
            self.update_vote(userid, factid, 1)
        else:
            return False
        return True

    # Add downvote
    def downvote(self, userid, factid):
        vote = self.get_vote(userid, factid)
        if vote is None:
            self.add_vote(userid, factid, -1)
        elif vote == 1:
            self.update_vote(userid, factid, -1)
        else:
            return False
        return True

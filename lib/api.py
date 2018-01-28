from flask import abort, request
from flask_restful import Resource
from lib.database import Database
from lib.util import EndpointParser as EP
from json import loads, dumps

class Endpoint(Resource):
    
    def __init__(self):
        self.db  = Database()
 
    # Valid GET request:
    #
    #   GET /v1/<userid>
    #   GET /v1/<userid>/<flag>
    #   GET /v1/<userid>/facts (return facts)
    #
    #   GET /v1/fact/<factid>
    #   GET /v1/fact/<factid>/<flag>
    #   GET /v1/fact/<factid>/votes
    #
    def get(self, key_path):
        rv = []
        endpoint = EP.parse_endpoint(key_path)

        # Check if endpoint is 'fact' otherwise, it will be userid
        user_requested_fact = False
        if len(endpoint) >= 1:
            if endpoint[0] == "fact":
                if len(endpoint) > 1:
                    factid = endpoint[1]
                    if self.db.fact_exists(factid):
                        rv = self.db.get_fact(factid)
                        user_requested_fact = True
                        if len(endpoint) == 3:
                            try:
                                rv = rv[endpoint[2]]
                            except:
                                try:
                                    if endpoint[2] == "votes":
                                        rv = self.db.get_vote_count(factid)
                                except:
                                    abort(400, 
                                        "No endpoint found matching '{}'".format(key_path))
                        elif len(endpoint) >= 3:
                            abort(400, "Bad endpoint.")
                    else:
                        abort(400, "Fact ID {} does not exist.".format(factid))
                else:
                    abort(400, "No fact ID specified.")

        if not user_requested_fact and len(endpoint) >= 1:
            # A userid was specified in the endpoint
            userid = endpoint[0]
            if self.db.user_exists(userid):
                user_details = self.db.get_user_details(userid)
                if len(endpoint) == 2:
                    flag = endpoint[1]
                    
                    # Check if there is a column in the database matching `flag`
                    try:
                        rv = user_details[flag]
                    except:
                        if flag == "facts":
                            rv = self.db.get_user_facts(userid)
                        else:
                            abort(400, "No endpoint found matching '{}'.".format(key_path))

                elif len(endpoint) > 2:
                    abort(404, "Bad endpoint.")

                else:  # return all user details
                    rv = user_details

            else:
                abort(404, "No user exists with ID {}.".format(userid))

        elif not user_requested_fact:
            abort(400, "Bad payload!")

        return rv


    # Valid post request:
    #
    #   POST /v1/<userid>
    #       payload: {"highlight":"", "replacement":"", description":""}
    #
    #   POST /v1/<userid>/<factID>/<flag>
    #       payload: "www.google.com" (if flag is 'url')
    #
    #   POST /v1/fact/<factid>/<userid>/<action>
    #       action is "upvote" or "downvote", no payload
    #
    def post(self, key_path):
        rv = []
        endpoint = EP.parse_endpoint(key_path)

        is_vote_action = False
        if len(endpoint) == 4 and endpoint[0] == "fact":
            is_vote_action = True
            factid = endpoint[1]
            userid = endpoint[2]
            flag   = endpoint[3]
            if not self.db.fact_exists(factid) or not self.db.user_exists(userid):
                abort(400, "User and/or fact ID does not exist.")
            if flag == "upvote":
                rv = self.db.upvote(userid, factid)
            elif flag == "downvote":
                rv = self.db.downvote(userid, factid)
            else:
                abort(400, "Unknown flag, '{}'.".format(flag))
        if not is_vote_action:
            if len(endpoint) == 2:
                if endpoint[0] == "create_user":
                    userid = endpoint[1]
                    if not self.db.user_exists(userid):
                        rv = self.db.create_user(userid)
                        return rv
                    else:
                        abort(400, "User already exists.")

            # Check if given userid exists in database
            if len(endpoint) >= 1:
                userid = endpoint[0]
                user_exists = self.db.user_exists(userid)
            else:
                abort(400, "Bad payload!")

            # If userid doesn't exist, abort
            if not user_exists:
                abort(404, "No user exists with ID {}.".format(userid))

            # Try to decode the data payload
            data_is_string = False
            try:
                data = request.data.decode("utf-8")
                try:
                    data = loads(data)
                except ValueError:
                    data_is_string = True
            except (TypeError, ValueError) as error:
                abort(400, "Bad data payload ({} bytes).".format(len(request.data)))

            # Determine if user is POSTing a new fact or updating an old one
            if len(endpoint) == 1:  # User is POSTing a new fact
                if "highlight" in data and "replacement" in data and \
                   "description" in data and "url" in data:
                    self.db.add_fact(userid,
                        data["highlight"], data["replacement"], data["description"], data["url"])
                else:
                    abort(400, "Bad payload, must provide highlight, replacement, and description fields.")
                rv = data

            elif len(endpoint) == 3:  # User is updating a fact
                columns = self.db.get_columns("facts")
                factid  = endpoint[1]
                flag    = endpoint[2]
                if factid < 0 or not self.db.fact_exists(factid):
                    abort(400, "Fact with ID {} does not exist.".format(factid))
                if flag in columns:
                    self.db.update_fact(factid, flag, data)
                else:
                    abort(400, "Fact update failed, flag '{}' is not recognized.".format(flag))
                rv = data

            elif len(endpoint) == 2:  # User is requesting a computed flag
                flag = endpoint[1]
                if flag == "get_facts_by_url":
                    if "url" in data:
                        rv = self.db.get_facts_by_url(data["url"])
                        if rv:
                            rv = [self.db.get_fact(factid) for factid in rv]
                    else:
                        abort(400, "Bad payload.")

            else:
                abort(404, "Bad endpoint.")
    
        return rv

    # Delete a fact and all associated votes. User's facts_posted statistic is
    # also decremented.
    #
    #   DELETE /v1/fact/4
    #
    def delete(self, key_path):
        rv = []
        endpoint = EP.parse_endpoint(key_path)

        if len(endpoint) == 2:
            if endpoint[0] == "fact":
                factid = endpoint[1]
                if self.db.fact_exists(factid):
                    rv = self.db.delete_fact(factid)
                else:
                    rv = {"message": "Specified fact ID does not exist."}

            else:
                abort(404, "Bad endpoint.")

        else:
            abort(404, "Bad endpoint.")

        return rv
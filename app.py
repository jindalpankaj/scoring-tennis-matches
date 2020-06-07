from flask import Flask, render_template, request, jsonify

point_winner_list = list()
server_list = list()

app = Flask(__name__)


# define a decorator for home route
@app.route("/")
def get_player_names():
    return render_template("submit_players.html")


@app.route("/score_it", methods=['POST'])
def score_the_match():
    p1_name = request.form['p1name_name']
    p2_name = request.form['p2name_name']
    n_sets = request.values['grid_nsets']
    tb_pts = request.values['grid_tb']
    return render_template("score_the_match.html",
                           p1_name=p1_name, p2_name=p2_name, n_sets=n_sets, tb_pts=tb_pts)
    # return jsonify(request.form)


@app.route("/receivedata", methods=['POST'])
def receive_data():
    global point_winner_list
    global server_list
    # print(request.form['point_winner'])
    point_winner_list.append(request.form['point_winner'])
    server_list.append(request.form['p_serve'])
    return "OK"


# @app.route("/tech_version/<version_id>")
# def display_tech_details(version_id):
#     return render_template("tech_detail.html", version_id=version_id)

# running the server
# app.run(debug=False)


# For heroku
if __name__ == "__main__":
    app.run(port=5000)

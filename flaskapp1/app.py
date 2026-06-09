from flask import Flask, render_template

app = Flask(__name__)

from routes.thung_than import thung_bp
from routes.san_thao_tac import san_bp
from routes.khoi_luong_tam import tam_bp
from routes.merge_pdf import pdf_bp

app.register_blueprint(thung_bp)
app.register_blueprint(san_bp)
app.register_blueprint(tam_bp)
app.register_blueprint(pdf_bp)


@app.route("/")
def home():
    return render_template("home.html")


if __name__ == "__main__":
    app.run()
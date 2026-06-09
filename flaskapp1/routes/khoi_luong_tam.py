import re
from flask import Blueprint, render_template, request

tam_bp = Blueprint("tam", __name__)


def get_eval(name):
    text = request.form.get(name, "").strip()

    if not text:
        return 0

    if not re.match(r'^[0-9+\-*/(). ]+$', text):
        return 0

    try:
        return eval(text)
    except:
        return 0


@tam_bp.route("/khoi-luong-tam", methods=["GET", "POST"])
def khoi_luong_tam():

    ket_qua = None

    if request.method == "POST":
        a = get_eval("tam1")
        b = get_eval("tam2")
        c = get_eval("tam3")
        d = get_eval("tam4")
        e = get_eval("tam5")
        f = get_eval("tam6")
        m = get_eval("tam8")

        kg = 0.00785 * (
            0.001 * a +
            0.002 * b +
            0.003 * c +
            0.004 * d +
            0.005 * e +
            0.006 * f +
            0.008 * m
        )

        ket_qua = round(kg, 2)

    return render_template(
        "khoi_luong_tam.html",
        ket_qua=ket_qua,
        form=request.form,
        active_page="tam"
    )
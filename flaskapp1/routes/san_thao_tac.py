from flask import Blueprint, render_template, request

san_bp = Blueprint("san", __name__)

THEP = 7850
MM3 = 1_000_000_000


def get_float(name):
    try:
        return float(request.form.get(name, 0))
    except:
        return 0


@san_bp.route("/san-thao-tac", methods=["GET", "POST"])
def san_thao_tac():

    ket_qua = None

    if request.method == "POST":

        A2 = get_float("chieu_dai")
        B2 = get_float("chieu_rong")
        C2 = get_float("chieu_cao")
        D2 = get_float("do_day_ton")
        E2 = get_float("so_chan")

        F11 = get_float("thanh_ngang")
        G11 = get_float("thanh_doc")

        khoi_luong_san = (
            ((A2*(B2/500+1) + B2*(A2/500+1)) * 160 * D2 * THEP / MM3)
            + (C2 * 300 * D2 * E2 * THEP / MM3)
            + (A2 * B2 * 11 / 1_000_000)
            + ((A2 + B2 - 240) * 2 * 140 * 3 * THEP / MM3)
            + 29.3
        )

        khoi_luong_thang = (
            0.006954 * C2
            + 0.005299 * (A2 + B2)
            + 3.9154
        )

        khoi_luong_vong = F11 * 1.14 + G11 * 2 + 0.87

        tong = (
            khoi_luong_san
            + khoi_luong_thang
            + khoi_luong_vong
        )

        ket_qua = {
            "san": round(khoi_luong_san, 2),
            "thang": round(khoi_luong_thang, 2),
            "vong": round(khoi_luong_vong, 2),
            "tong": round(tong, 2)
        }

    return render_template(
        "san_thao_tac.html",
        ket_qua=ket_qua,
        form=request.form,
        active_page="san"
    )
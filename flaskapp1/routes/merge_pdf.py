from flask import Blueprint, render_template, request, send_file
from pypdf import PdfReader, PdfWriter
from io import BytesIO

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/merge-pdf")
def merge_pdf():
    return render_template(
        "merge_pdf.html",
        active_page="pdf"
    )


@pdf_bp.route("/merge-pdf/run", methods=["POST"])
def merge_pdf_run():

    files = request.files.getlist("pdfs")

    output_name = request.form.get("output_name", "Merged.pdf")

    writer = PdfWriter()

    for file in files:
        reader = PdfReader(file)

        for page in reader.pages:
            writer.add_page(page)

    pdf_buffer = BytesIO()
    writer.write(pdf_buffer)
    pdf_buffer.seek(0)

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=output_name,
        mimetype="application/pdf"
    )

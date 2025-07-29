import pdfplumber

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from all pages of a PDF and returns it as a single string.
    """
    print(f"--- Reading PDF: {pdf_path} ---")
    full_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
        return full_text
    except Exception as e:
        return f"Error reading PDF: {e}"

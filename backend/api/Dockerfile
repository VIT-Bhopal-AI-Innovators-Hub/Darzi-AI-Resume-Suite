FROM python:3.12.6

WORKDIR /code

RUN pip install --no-cache-dir uv
ENV VIRTUAL_ENV=/code/.venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY . .
RUN uv pip install -e .

ENV PORT=7860
EXPOSE $PORT

CMD ["python", "main.py"]
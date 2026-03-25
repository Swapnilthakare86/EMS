import pandas as pd
import uuid
import tempfile
import os
import re

def create_csv(data, prefix):
    safe_prefix = re.sub(r"[^a-zA-Z0-9_-]", "", prefix)
    file_name = f"{safe_prefix}_{uuid.uuid4().hex}.csv"
    file_path = os.path.join(tempfile.gettempdir(), file_name)
    df = pd.DataFrame(data)
    df.to_csv(file_path, index=False)
    return file_path

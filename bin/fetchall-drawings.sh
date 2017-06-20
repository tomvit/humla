grep h-drawing lecture* | egrep -o "id=\"[a-zA-Z0-9_\-]+\"" | egrep -o "[a-zA-Z0-9_\-]+" | grep -v "id"

#!/bin/bash

set -euo pipefail

if [[ "$1" == "generate" ]]; then
    

    ICONS=$(grep -RiP --no-filename --only-matching "fluent:[0-9a-zA-Z-_]*" ../components ../views | sort -u)

    if [ -f icons.list ] && [ -f icons.ts ] && diff icons.list - <<<"$( echo $ICONS )" 2>&1 > /dev/null; then
        echo icons.ts exists and does not need to be updated
        exit 0
    fi

    echo $ICONS > icons.list

    OUT=icons.ts

    echo "const icons: { [key: string]: string; } = {" > $OUT

    for I in $ICONS; do
        echo -n '  "'$I'":' "'" >> $OUT
        curl https://api.iconify.design/$(echo $I| sed -e 's#:#/#').svg | xmllint --xpath "/*/*" - | tr -d "\n" >> $OUT
        echo "'," >> $OUT
    done;
    echo "};" >> $OUT
    echo "export default icons" >> $OUT

elif [[ "$1" == "check" ]]; then
    
    ICONS=$(grep -RiP --no-filename --only-matching "fluent:[0-9a-zA-Z-_]*" ../components ../views | sort -u)
    for I in $ICONS; do
        (grep "\"$I\":" icons.ts 2>&1 >/dev/null || (echo "Error: missing icon $I" && false))
    done

fi

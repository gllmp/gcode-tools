#!/usr/bin/bash
# transform a video file with 16:9 aspect ratio into 4:3
# USAGE: vx input output
function vx() {
    help() {
      echo "usage: vx input output"
      echo "-input        file input path"
      echo "-output       file output path"
      echo ""
    }
    if [[ "$#" -eq 0 ]]; then
      help
    else
      help
      ffmpeg -i $1 -filter:v "pad=iw:iw*3/4:(ow-iw)/2:(oh-ih)/2" -c:a copy $2
    fi
}
#!/bin/bash

OUT=output
WRK=$PWD/wrk

ripmime -i "$1" -d $WRK

gpg --decrypt <$WRK/msg.asc >$WRK/foo.msg
ripmime -i $WRK/foo.msg -d $OUT

rm $WRK/*


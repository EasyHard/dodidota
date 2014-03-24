#!/bin/bash

rsync -auvz -e 'ssh -l root' . root@mos1:dev/dodidota/.

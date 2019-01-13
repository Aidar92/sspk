import sys
import socket
import json

res = json.loads(sys.argv[1])["data"]
data = [int(x) for x in res[1:-5]]
bytes_ = [[0,0],[0,0],[0,0],[0,0],[0,0],0,0,0]
for i in range(0, len(data)):
    if data[i] == -15:
        bytes_[i//2][not i%2] = '0000'
    if data[i] == -14:
        bytes_[i//2][not i%2] = '1000'
    if data[i] ==  -13:
        bytes_[i//2][not i%2] = '0100'
    if data[i] == -12:
        bytes_[i//2][not i%2] = '1100'
    if data[i] == -11:
        bytes_[i//2][not i%2] = '0010'
    if data[i] == -10:
        bytes_[i//2][not i%2] = '1010'
    if data[i] == -9:
        bytes_[i//2][not i%2] = '0110'
    if data[i] == -8:
        bytes_[i//2][not i%2] = '1110'
    if data[i] == -7:
        bytes_[i//2][not i%2] = '0001'
    if data[i] == -6:
        bytes_[i//2][not i%2] = '1001'
    if data[i] == -5:
        bytes_[i//2][not i%2] = '0101'
    if data[i] == -4:
        bytes_[i//2][not i%2] = '1101'
    if data[i] == -3:
        bytes_[i//2][not i%2] = '0011'
    if data[i] == -2:
        bytes_[i//2][not i%2] = '1011'
    if data[i] == -1:
        bytes_[i//2][not i%2] = '0111'
    if data[i] == 0:
        bytes_[i//2][not i%2] = '1111'

result = [int(''.join(x),2) for x in bytes_[0:-3]]
result.extend([0,0,0])
tmp = [x for x in bin(result[-3])[2::].zfill(8)]
if res[-2] == 1:
    tmp[0] = '1'
if res[-3] == 1:
    tmp[4] = '1'
if res[-4] == 1:
    tmp[3] = '1'
if res[-5] == 1:
    tmp[2] = '1'
tmp[5::] = bin(int(res[-1]))[2::].zfill(3)
result[-3] = int(''.join(tmp), 2)
result[-1] = abs(int((float(res[0])+15.5)*2))
setState = bytearray(16)
setState[0] = 3
setState[4:7] = (1517).to_bytes(4, byteorder='little')
setState[8::] = result

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(setState, ('127.0.0.1', 1517))
import sys
import socket
import json

port = 0
getHost = ''
state = 0
sendHost = ''
with open("etc/config.json", "r") as f:
    data = json.load(f)
    port = data["sendPort"]
    getHost = data["getHost"]
    sendHost = data["sendHost"]
    state = data["statePort"]
    getPort = data["getPort"]
resSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
resSock.bind((getHost, getPort))
result = []
setState = bytearray(16)
setState[0] = 1
setState[4:7] = (getPort).to_bytes(4, byteorder='little')
resSock.sendto(setState, (sendHost, state))
recieve = [bin(x)[2::].zfill(8) for x in resSock.recv(1024)]
resSock.close()
tmp = [[x[4::], x[0:4]] for x in recieve[8::]]
data = [[0,0],[0,0],[0,0],[0,0],[0,0],0] 
for i in range(0, len(tmp) - 3):
    for j in range(0,2):
        if tmp[i][j] == '0000':
            data[i][j] = -15
        elif tmp[i][j] == '1000':  
            data[i][j] = -14
        elif tmp[i][j] == '0100':  
            data[i][j] = -13
        elif tmp[i][j] == '1100':  
            data[i][j] = -12
        elif tmp[i][j] == '0010':  
            data[i][j] = -11
        elif tmp[i][j] == '1010':  
            data[i][j] = -10
        elif tmp[i][j] == '0110':  
            data[i][j] = -9
        elif tmp[i][j] == '1110':  
            data[i][j] = -8
        elif tmp[i][j] == '0001':  
            data[i][j] = -7
        elif tmp[i][j] == '1001':  
            data[i][j] = -6
        elif tmp[i][j] == '0101':  
            data[i][j] = -5
        elif tmp[i][j] == '1101': 
            data[i][j] = -4
        elif tmp[i][j] == '0011':  
            data[i][j] = -3
        elif tmp[i][j] == '1011':  
            data[i][j] = -2
        elif tmp[i][j] == '0111':  
            data[i][j] = -1
        elif tmp[i][j] == '1111':  
            data[i][j] = 0   
data[-1] = int(recieve[-1], 2) / 2 - 15.5
for n in range(1,len(data) - 1):
    data[n] = data[n-1] + data[n]    
result.append(data[-1])
result.extend(data[-2])  
status = [0,0,0,0]
status[0] = recieve[-3][2] == '1'  
status[1] = recieve[-3][3] == '1'
status[2] = recieve[-3][4] == '1'
status[3] = recieve[-3][0] == '1'
syncRange = int(recieve[-3][-3::], 2)
print({'data': result, 'status': status, 'syncRange': syncRange})
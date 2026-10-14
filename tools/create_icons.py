import struct,zlib,pathlib
root=pathlib.Path(__file__).resolve().parent.parent/'icons'
root.mkdir(exist_ok=True)
def png(path,size):
 grid=[[(38,61,67) for x in range(64)] for y in range(64)]
 def rect(x,y,w,h,c):
  for yy in range(y,y+h):
   for xx in range(x,x+w):
    if 0<=yy<64 and 0<=xx<64:grid[yy][xx]=c
 paper=(247,237,209);green=(111,163,125);wood=(211,174,112);dark=(60,83,85);blue=(127,181,195)
 rect(13,14,38,6,green);rect(10,20,44,4,paper);rect(13,24,38,26,paper);rect(13,24,38,3,wood)
 for x in range(13,51,8):rect(x,20,4,4,wood)
 rect(17,30,16,12,dark);rect(18,31,14,10,blue);rect(20,33,4,6,(188,219,216));rect(37,30,10,20,dark);rect(38,31,8,18,green);rect(40,40,2,2,paper)
 rect(10,50,44,4,wood);rect(8,54,48,2,(117,140,119));rect(26,9,12,3,paper);rect(50,8,3,9,wood);rect(47,11,9,3,wood)
 raw=b''.join(b'\x00'+bytes(v for xx in range(size) for v in grid[y*64//size][xx*64//size]) for y in range(size))
 def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
 path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
for name,size in [('icon-192.png',192),('icon-512.png',512),('maskable-512.png',512),('apple-touch-icon.png',180)]:png(root/name,size)

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import protobuf from 'protobufjs';
import { packetNames } from '../protobuf/packetNames.js';

// 현재 파일의 절대 경로. 이 경로는 파일의 이름을 포함한 전체 경로
const __filename = fileURLToPath(import.meta.url);

// path.dirname() 함수는 파일 경로에서 디렉토리 경로만 추출 (파일 이름을 제외한 디렉토리의 전체 경로)
const __dirname = path.dirname(__filename);
const protoDir = path.join(__dirname, '../protobuf');

// 주어진 디렉토리 내 모든 proto 파일을 재귀적으로 찾는 함수
const getAllProtoFiles = (dir, fileList = []) => {
  // 디렉토리 내 모든 파일 읽기
  const files = fs.readdirSync(dir);

  // 모든 읽은 파일에 대해
  files.forEach((file) => {
    // filePath = 디렉토리 경로 + 파일 명
    const filePath = path.join(dir, file);

    // 읽은 파일이 디렉토리면 재귀호출
    if (fs.statSync(filePath).isDirectory()) {
      getAllProtoFiles(filePath, fileList);
    }
    // 읽은 파일이 디렉토리가 아니고 확장자가 .proto 면 fileList에 추가
    else if (path.extname(file) === '.proto') {
      fileList.push(filePath);
    }
  });
  return fileList;
};

// 모든 proto 파일 경로를 가져옴
const protoFiles = getAllProtoFiles(protoDir);

// 로드된 프로토 메시지들을 저장할 객체
const protoMessages = {};

// 모든 .proto 파일을 로드하여 프로토 메시지를 초기화합니다.
export const loadProtos = async () => {
  try {
    const root = new protobuf.Root();

    await Promise.all(protoFiles.map((file) => root.load(file)));

    for (const [packageName, types] of Object.entries(packetNames)) {
      //   console.log(packageName);
      //   console.log(types);
      protoMessages[packageName] = {};
      for (const [type, typeName] of Object.entries(types)) {
        protoMessages[packageName][type] = root.lookupType(typeName);
      }
    }

    console.log('Protobuf 파일이 로드되었습니다.');
  } catch (error) {
    console.error('Protobuf 파일 로드 중 오류가 발생했습니다: ', error);
  }
};

// 로드된 프로토 메시지들의 얕은 복사본을 반환합니다.
export const getProtoMessages = () => {
  // console.log('protoMessages:', protoMessages); // 디버깅을 위해 추가
  return { ...protoMessages };
};

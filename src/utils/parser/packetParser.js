import { config } from '../../config/config.js';
import { getProtoTypeNameByHandlerId } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

export const packetParser = (data) => {
  const protoMessages = getProtoMessages();

  // 공통 패킷 구조를 디코딩
  const Packet = protoMessages.common.Packet;
  let packet;
  try {
    packet = Packet.decode(data);
  } catch (e) {
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, '패킷 디코딩 중 오류가 발생했습니다.');
  }

  const handlerId = packet.handlerId;
  const userId = packet.userId;
  const clientVersion = packet.clientVersion;
  //   const payload = packet.payload;
  const sequence = packet.sequence;

  //   console.log(`clientVersion: ${clientVersion}`);
  if (clientVersion !== config.client.version) {
    // console.error(`클라이언트 버전이 일치하지 않습니다.`);
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      '클라이언트 버전이 일치하지 않습니다.',
    );
  }

  const protoTypeName = getProtoTypeNameByHandlerId(handlerId);
  if (!protoTypeName) {
    // console.error(`알 수 없는 핸들러 ID: ${handlerId}`);
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, `알 수 없는 핸들러 ID: ${handlerId}`);
  }

  const [namespace, typeName] = protoTypeName.split('.');
  const PayloadType = protoMessages[namespace][typeName];
  let payload;

  try {
    payload = PayloadType.decode(packet.payload);
  } catch (e) {
    // console.error(e);
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, '패킷 디코딩 중 오류가 발생했습니다.');
  }

  // decode 과정에서 이미 verify 과정을 거치기 때문에 꼭 필요한 코드는 아님
  const errorMessage = PayloadType.verify(payload);
  if (errorMessage) {
    // console.error(`패킷 구조가 일치하지 않습니다: ${errorMessage}`);
    throw new CustomError(
      ErrorCodes.PACKET_STRUCTURE_MISMATCH,
      `패킷 구조가 일치하지 않습니다: ${errorMessage}`,
    );
  }

  // 필드가 비어있는 경우 = 필수 필드가 누락된 경우
  const expectedFields = Object.keys(PayloadType.fields);
  const actualFields = Object.keys(payload);
  const missingFields = expectedFields.filter((field) => !actualFields.includes(field));

  if (missingFields.length > 0) {
    // console.error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    throw new CustomError(
      ErrorCodes.MISSING_FIELDS,
      `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
    );
  }

  return { handlerId, userId, payload, sequence };
};

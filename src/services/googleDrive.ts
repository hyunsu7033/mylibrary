import { BackupData } from '../types/book';

declare global {
  interface Window {
    google?: any;
  }
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
}

/**
 * Google Identity Services (GIS) OAuth 토큰 발급
 */
export async function getGoogleDriveAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      reject(new Error('Google SDK가 로드되지 않았습니다. 인터넷 연결을 확인해주세요.'));
      return;
    }

    if (!clientId) {
      reject(new Error('Google Client ID가 설정되지 않았습니다. [설정]에서 Client ID를 입력해주세요.'));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error_description || resp.error));
          return;
        }
        resolve(resp.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * 구글 드라이브에 서재 백업 파일 업로드
 */
export async function uploadBackupToDrive(accessToken: string, backupData: BackupData): Promise<{ id: string; name: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `MyLibrary_Backup_${timestamp}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `My Library Personal Bookshelf Backup (${backupData.books.length}권의 도서 및 인사이트)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive 업로드 실패: ${errorText}`);
  }

  const result = await response.json();
  return { id: result.id, name: fileName };
}

/**
 * 구글 드라이브에 저장된 MyLibrary 백업 파일 목록 조회
 */
export async function listDriveBackups(accessToken: string): Promise<DriveBackupFile[]> {
  const query = "name contains 'MyLibrary_Backup_' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,size)&orderBy=createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('구글 드라이브 파일 목록을 가져오지 못했습니다.');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * 구글 드라이브에서 백업 파일 다운로드 및 파싱
 */
export async function downloadBackupFromDrive(accessToken: string, fileId: string): Promise<BackupData> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('백업 파일 다운로드에 실패했습니다.');
  }

  const backupJson = await response.json();
  if (!backupJson || !Array.isArray(backupJson.books)) {
    throw new Error('올바른 백업 파일 형식이 아닙니다.');
  }

  return backupJson;
}

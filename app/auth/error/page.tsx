'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return '服务器配置错误，请联系管理员';
      case 'AccessDenied':
        return '访问被拒绝，您可能没有权限访问此应用';
      case 'Verification':
        return '验证失败，请重试';
      case 'OAuthSignin':
        return 'OAuth登录失败，请检查Casdoor配置';
      case 'OAuthCallback':
        return 'OAuth回调失败，请检查回调URL配置';
      case 'OAuthCreateAccount':
        return '创建账户失败';
      case 'EmailCreateAccount':
        return '邮箱创建账户失败';
      case 'Callback':
        return '回调处理失败';
      case 'OAuthAccountNotLinked':
        return '账户未关联，请使用其他方式登录';
      case 'EmailSignin':
        return '邮箱登录失败';
      case 'CredentialsSignin':
        return '凭据登录失败';
      case 'SessionRequired':
        return '需要登录才能访问';
      default:
        return '登录时发生未知错误';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-black dark:text-white">
            登录失败
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            错误类型: {error || '未知错误'}
          </p>
          <p className="mt-4 text-red-600 dark:text-red-400">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-black dark:border-white rounded-md text-sm font-medium text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            重新登录
          </Link>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>请确保：</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Casdoor服务正常运行</li>
              <li>• 回调URL配置正确: {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:5632'}/api/auth/callback/casdoor</li>
              <li>• 客户端ID和密钥正确</li>
              <li>• 应用名称和组织名称匹配</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
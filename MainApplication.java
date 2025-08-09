package com.test_api;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Notification;
import android.os.Build;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactHost;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

// 🔥 FCM 관련 import 추가
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingPackage;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
        new DefaultReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
                return BuildConfig.DEBUG;
            }

            @Override
            protected String getJSMainModuleName() {
                return "index";
            }

            @Override
            protected List<ReactPackage> getPackages() {
                @SuppressWarnings("UnnecessaryLocalVariable")
                List<ReactPackage> packages = new PackageList(this).getPackages();
                
                // 🔥 FCM 패키지가 자동으로 추가되지 않은 경우 수동 추가
                // packages.add(new ReactNativeFirebaseMessagingPackage());
                
                return packages;
            }
        };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public ReactHost getReactHost() {
        return DefaultReactHost.getDefaultReactHost(getApplicationContext(), getReactNativeHost());
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, false);

        // 🔥 알림 채널 생성 (Android 8.0 이상 필수)
        createNotificationChannels();

        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            DefaultNewArchitectureEntryPoint.load();
        }
    }

    // 🔥 헤드업 알림을 위한 알림 채널 생성
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);

            // 헤드업 알림용 채널 (높은 우선순위)
            NotificationChannel headsUpChannel = new NotificationChannel(
                "heads_up_channel",                    // 서버 설정과 동일한 채널 ID
                "카카오톡 스타일 헤드업 알림",               // 채널 이름
                NotificationManager.IMPORTANCE_HIGH    // 🔥 높은 중요도 (헤드업 표시 필수)
            );
            headsUpChannel.setDescription("중요한 메시지 알림을 즉시 화면에 표시합니다");
            headsUpChannel.enableVibration(true);
            headsUpChannel.enableLights(true);
            headsUpChannel.setShowBadge(true);
            headsUpChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            
            notificationManager.createNotificationChannel(headsUpChannel);

            // 일반 알림용 채널 (기본 우선순위)
            NotificationChannel defaultChannel = new NotificationChannel(
                "default_channel",
                "일반 알림",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            defaultChannel.setDescription("일반적인 앱 알림");
            
            notificationManager.createNotificationChannel(defaultChannel);
        }
    }
}
package com.devmind.ai.service;

public interface StreamCallback {
    void onChunk(String chunk) throws Exception;
    void onComplete() throws Exception;
    void onError(Throwable throwable);
}

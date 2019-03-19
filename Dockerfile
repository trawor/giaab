FROM trawor/node

WORKDIR /app

# 只拿到package文件 提高速度
ADD ./package.json /app/

# 先安装生成环境依赖
# flat 可以大幅减小image大小, 但是会有冲突
RUN yarn install --production


# FROM dependencies AS release
ADD ./ /app/
RUN rm -rf /app/test

EXPOSE 3000
CMD ["yarn", "start"]

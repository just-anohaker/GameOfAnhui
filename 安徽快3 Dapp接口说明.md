# 安徽快3 Dapp接口说明

假定当前使用的节点信息是http://192.168.2.58:4096

当前使用的安徽快3 Dapp的id是“81961c799bf3f47652e7bab01d4e8437134374a7a114cfab1e89621bf644ca89”

则文档说明使用节点接口并以"/"开头的路径时，表示前面加上http://192.168.2.58:4096;

文档说明使用Dapp接口并以"/"开头的路径时，表示在前面加上https://192.168.2.58:4096/api/dapps/81961c799bf3f47652e7bab01d4e8437134374a7a114cfab1e89621bf644ca89;

## 交易

### (PUT)注(Dapp接口/transactions/unsigned)

![image-20190716094033631](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716094033631.png)

![image-20190716094401074](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716094401074.png)

如上图所示：

使用Dapp接口/transactions/unsigned可以发出下注交易

| 字段   | 类型                               | 说明                             |
| ------ | ---------------------------------- | -------------------------------- |
| secret | string                             | 下注账号对应的secret值           |
| fee    | String                             | 交易所需交易费，测试默认使用"0"  |
| type   | number                             | 交易类型，固定为1103(下注交易)   |
| args   | string(使用JSON.stringify进行处理) | 下注参数详情，参见"下注参数详情" |

#### 下注参数详情

下注参数为JSON.stringify处理后的字符串，是一个json数组，数组需要有两个item([期号, 下注定单列表])

期号：游戏当前进行到的期号值，设定了一天40期，格式YYYYMMDDXXX(Y表示年，M表示月，D表示天，X表示当天的累加次数)，如20190716001表示2019年7月16号第1期

下注订单列表(数组)：

​		mode: 游戏类型

​		point: 下注点数

​		amount: 下注金额

其中游戏类型和下注点数如下列图表所示

![image-20190716101508803](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716101508803.png)

![image-20190716101526402](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716101526402.png)

![image-20190716101545713](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716101545713.png)

![image-20190716101606676](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716101606676.png)

![image-20190716101618864](/Users/anohaker/Library/Application Support/typora-user-images/image-20190716101618864.png)



## 查询

#### (GET)戏账号余额查询(Dapp接口/account/game_balance)

| 字段    | 类型   | 说明             |
| ------- | ------ | ---------------- |
| address | String | 查询的账号的地址 |

####(GET)主链ETM余额查询(Dapp接口/account/chain_balance)

| 字段    | 类型   | 说明           |
| ------- | ------ | -------------- |
| address | String | 查询的账号地址 |

#### (GET)当前游戏期号查询(Dapp接口/game/period)

参数无

#### (GET)完成游戏期号查询(Dapp接口/game/periods)

| 字段     | 类型   | 说明                                                      |
| -------- | ------ | --------------------------------------------------------- |
| datetime | String | 格式为：年(2019)月(07)日(19)[YYYYMMDD],不填表示获取所有的 |
| offset   | number | 起始索引,默认为0                                          |
| limit    | number | 最大获取数量，默认为40                                    |

#### (GET)取用户下注信息(Dapp接口/account/bettings)

| 字段    | 类型   | 说明                                                         |
| ------- | ------ | ------------------------------------------------------------ |
| address | String | 账号地址                                                     |
| cond    | String | 条件，“0”：所有下注记录，“1”：未开奖的下注记录，“2”：已中奖的下注记录， “3”：未中奖的下注记录 |
| offset  | number | 起始索引，默认为0                                            |
| limit   | number | 最大获取数量，默认为100                                      |

#### (GET)用户报表(Dapp接口/account/crystal)

| 字段    | 类型   | 说明                                     |
| ------- | ------ | ---------------------------------------- |
| address | String | 账号地址                                 |
| cond    | String | 条件，“0”：最近7天，“1”：本周，“2“：上周 |



## 通知

##### start-period

data: periodId(期号)

##### mothball-period

data: periodId(期号)

##### end-period

data: {

​	periodId(期号),

​	points(骰子点数 array[3]),

​	hash(产生骰子点数的随机源hash值)

}



## 随机源信息获取

随机源域名：http://47.111.165.42:4567



获取产生Hash的数据源

![image-20190719135339374](/Users/anohaker/Library/Application Support/typora-user-images/image-20190719135339374.png)

### (GET)/random/getInfo

***参数***

| 字段 | 类型   | 说明                                                 |
| ---- | ------ | ---------------------------------------------------- |
| hash | String | 需要查询的hash值，即每一个period结束时获取到的hash值 |

***返回值***

| 字段       | 类型                                | 说明                                                |
| ---------- | ----------------------------------- | --------------------------------------------------- |
| random     | String                              | 随机数hex字符串值                                   |
| index      | number                              | 随机数index索引值                                   |
| hashes     | Array<{id: string, height: number}> | 计算随机数用到的区块信息id:区块Id，height：区块高度 |
| iter       | number                              | 迭代次数                                            |
| sha256iter | Number                              | sha256计算迭代次数                                  |


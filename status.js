var token = "";
var apiFit = ""
var apiScan = ""


//今日と今日から一週間前の日付を取得
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth()+1;
var day = date.getDate();
var lwdate = computeDate(year, month, day, -6);
var lwyear = lwdate.getFullYear();
var lwmonth = lwdate.getMonth()+1;
var lwday = lwdate.getDate();

var dt = stdate(year, month, day);
var lwdt = stdate(lwyear, lwmonth, lwday);

console.log(dt);
console.log(lwdt);


//ヘルスケアAPIからデータの取得(Fit)
var lwUsedSum = 0;
var lwUsedCal = 0;
var aveUsed = 0;
$(function(){
  $.ajax({
    headers: {
      "X-AccessToken" : token
    },
    type: "GET",
    dataType: "json",
    url: apiFit,
    data: {
      startDate: lwdt, endDate: dt
    },
  }).done(function(data){
    console.log("get success fit");
    var result = $("#finalDate");
    result.empty();
    var results = data.results;
    lwUsedCalorie = 0;

    if(results.length > 0){
      for(var i = 0; i < results.length; i++){
        results[i].measurementDate;
        results[i].totalUsedCalories;
        results[i].walkingSteps;
        lwUsedSum = lwUsedSum + results[i].totalUsedCalories;
        lwUsedCal = lwUsedCal + lwUsedSum;
      }
      console.log("週消費cal " + lwUsedCal.toFixed(0));
      aveUsed = lwUsedCal / results.length;
      dtcall(aveUsed);
      $("#parseUsed").append("/" + aveUsed.toFixed(0) + ")");
      //配列要素の最大値（最新測定日）を表示
      var max = (Math.max(null, i)) - 1;
      $("#finalDate").append("<p>" + results[max].measurementDate + "</p>");
      $("#usedCalorie").append("<p>" + results[max].totalUsedCalories + " kcal" + "</p>");
      $("#steps").append("<p>" + results[max].walkingSteps + " 歩" + "</p>");
    }
  }).fail(function(jqXHR, textStatus, errorThrown){
     console.log(jqXHR + '-' + textStatus + '-' + errorThrown);
  });
});


//ヘルスケアAPIからデータの取得(Scan）
$(function(){
  $.ajax({
    headers: {
      "X-AccessToken" : token
    },
    type: "GET",
    dataType: "json",
    url: apiScan,
    data: {
      startDate: lwdt, endDate: dt
    },
  }).done(function(data){
    console.log("get success scan");
    var result2 = $("#weight");
    result2.empty();
    var results2 = data.results;

    if(results2.length > 0){
      for(var i = 0; i < results2.length; i++){
        results2[i].weight;
        results2[i].bodyFatPercent;
      }
      var max = (Math.max(null, i)) - 1;
      $("#weight").append("<p>" + results2[max].weight.toFixed(2) + " kg" + "</p>");
      $("#bodyfat").append("<p>" + results2[max].bodyFatPercent + " %" + "</p>");
    }
  }).fail(function(jqXHR, textStatus, errorThrown){
     console.log(jqXHR + '-' + textStatus + '-' + errorThrown);
  });
});

//データベースから今日の摂取カロリーを取得
var dburl = ""
var dtSumCal = 0;
$(function(){
  var data = {
    "operation": "query",
    "tablename": "xxx-devintern2016-1d-food",
    "payload": {
      KeyConditionExpression: '#d = :d',
      ExpressionAttributeNames  : {"#d" : "date"},
      ExpressionAttributeValues: {":d" : dt}
    }
  };
  $.ajax({
    type: "post",
    url: dburl,
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function(data){
      var dtFoods = data.Items;

      if(dtFoods.length > 0){
        for(var a = 0; a < dtFoods.length; a++){
        dtFoods[a].cal;
        dtSumCal = dtSumCal + dtFoods[a].cal;
        }
        $("#parseUsed").prepend("(" + dtSumCal);
        console.log("1日摂取cal: " + dtSumCal);
        dtcall(dtSumCal);
      }else{
        console.log("今日のデータ入力がまだです");
      }
    },
    error: function(){
      alert("HTTP Error !");
    }
  });
})


//週の摂取カロリー
var sumCal = 0;
var lwSumCal = 0;
for(var i = 0; i <= 6; i++){
  $(function(){
    var data = {
      "operation": "query",
      "tablename": "xxx-devintern2016-1d-food",
      "payload": {
        KeyConditionExpression: '#d = :d',
        ExpressionAttributeNames  : {"#d" : "date"},
        ExpressionAttributeValues: {":d" : dt}
      }
    };
    $.ajax({
      type: "post",
      url: dburl,
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "json",
      success: function(data){
        var lwFoods = data.Items;
        //console.log(lwFoods);
        if(lwFoods.length > 0){
          for(var b = 0; b < lwFoods.length; b++){
          lwFoods[b].cal;
          //console.log(lwFoods[b].cal);
          lwSumCal = lwSumCal + lwFoods[b].cal;
          sumCal += lwSumCal;
          }
          console.log("週摂取cal: " + sumCal);
          lwcall();
        }else{
          console.log("データ入力がまだです");
        }
      },
      error: function(){
        alert("HTTP Error !");
      }
    });
    dt = Number(dt) - 1;
    dt = String(dt);
  })
}



//今日肥満メーター

function dtcall(sum){
  return sum;
}
  $(function(){
    $("#dtMaxCalorie").jQMeter({
      goal:'1888',  //一日の摂取上限
      raised:dtcall(dtSumCal).toString(), //現在の摂取カロリー
      meterOrientation:'vertical',
      width:'290px',
      height:'40px'
    });
  });

//一週間肥満メーター
function lwcall(){
  $(function(){
    $("#lwMaxCalorie").jQMeter({
    goal:'$12,600',   //一週間の摂取上限
    raised:sumCal.toString(),   //一週間現在の摂取カロリー
    meterOrientation:'vertical',
    width:'290px',
    height:'40px'
    });
  });
}

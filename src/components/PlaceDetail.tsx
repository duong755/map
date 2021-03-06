import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonContent,
  IonRouterLink,
  useIonToast,
  IonImg,
  IonChip,
  IonLabel,
  IonButton,
} from "@ionic/react";
import { close, compassSharp, pricetagOutline } from "ionicons/icons";
import Rating from "@material-ui/lab/Rating";
import { Plugins } from "@capacitor/core";

import "./PlaceDetail.scss";
import { rate } from "../axios/rate";

const PlaceDetail: React.FC<PlaceDetailProps> = (props) => {
  const { detail, onDismiss } = props;
  const [rating, setRating] = useState<number | null>(null);
  const routerHistory = useHistory<{ destination: [number | undefined, number | undefined] }>();
  const [presentToast, dismiss] = useIonToast();

  const handleChangeRating = useCallback((event: React.ChangeEvent<{}>, value: number | null) => {
    setRating(value);
  }, []);

  const handleSubmitRate = useCallback(async () => {
    try {
      const { uuid: deviceId } = await Plugins.Device.getInfo();
      await rate.post("/rate", {
        placeId: detail?._id,
        deviceId: deviceId,
        rate: rating,
      });
      presentToast({
        message: "Đã thêm đánh giá",
        color: "success",
        duration: 5000,
        buttons: [
          {
            text: "Đóng",
            handler: dismiss,
          },
        ],
      });
    } catch (err) {
      presentToast({
        message: JSON.stringify(err),
        color: "danger",
        duration: 5000,
        buttons: [
          {
            text: "Đóng",
            handler: dismiss,
          },
        ],
      });
    }
  }, [rating, detail]);

  const showRoutingOnTheMap = useCallback(() => {
    routerHistory.push("/map", { destination: [detail?.latitude, detail?.longitude] });
    onDismiss();
  }, [detail, routerHistory]);

  return (
    <IonModal isOpen={detail !== void 0} swipeToClose={true} animated={true}>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start">Chi tiết</IonTitle>
          <IonIcon className="btn-close" slot="end" size="large" icon={close} onClick={() => onDismiss()} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="place-detail-content">
          <div className="place-name">
            <h3>{detail?.place_name}</h3>
          </div>
          <IonButton size="default" className="place-routing" onClick={showRoutingOnTheMap}>
            <IonIcon icon={compassSharp} size="large" />
            Chỉ đường
          </IonButton>
          <p>{detail?.place_address}</p>
          <IonRouterLink target="_blank" href={detail?.place_info_url}>
            {detail?.place_info_url}
          </IonRouterLink>
          <br />
          <div>{detail?.product}</div>
          <div>
            <IonChip color="primary" outline={true}>
              <IonLabel>{detail?.product_category}</IonLabel>
            </IonChip>
          </div>
          <div>
            <IonChip color="secondary" outline={true}>
              <IonIcon icon={pricetagOutline} />
              <IonLabel>
                {new Intl.NumberFormat("vi-VN", { currency: "VND", style: "currency" }).format(
                  detail?.product_price ?? 0
                )}
              </IonLabel>
            </IonChip>
          </div>
          <p>Lượt đánh giá: {detail?.rate_times}</p>
          <p>Điểm đánh giá: {detail?.rate}/5</p>
          <br />
          <IonImg src={detail?.prodct_image} />
          <br />
          <br />
          <div className="rating">
            <Rating name="rate-place" size="large" value={rating} onChange={handleChangeRating} />
            <div className="rate-text">
              {rating !== null &&
                (rating === 1
                  ? "Chán"
                  : rating === 2
                  ? "Tạm được"
                  : rating === 3
                  ? "Bình thường"
                  : rating === 4
                  ? "Tốt"
                  : "Tuyệt vời")}
            </div>
            <br />
            <IonButton size="large" color="primary" onClick={() => handleSubmitRate()}>
              Gửi đánh giá
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export { PlaceDetail };

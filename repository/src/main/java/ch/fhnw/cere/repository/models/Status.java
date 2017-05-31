package ch.fhnw.cere.repository.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;


@Entity
public class Status {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @JsonIgnore
    @ManyToOne(cascade = {CascadeType.REMOVE, CascadeType.PERSIST})
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "api_user_id")
    private ApiUser apiUser;

    @JsonIgnore
    @ManyToOne(cascade = {CascadeType.REMOVE, CascadeType.PERSIST})
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "feedback_id")
    private Feedback feedback;

    @ManyToOne(cascade = {CascadeType.PERSIST})
    @JoinColumn(name = "status_option_id")
    private StatusOption statusOption;

    public Status() {

    }

    public Status(ApiUser apiUser, Feedback feedback, StatusOption statusOption) {
        this.apiUser = apiUser;
        this.feedback = feedback;
        this.statusOption = statusOption;
    }

    @Override
    public String toString() {
        return String.format(
                "Status[id=%d, statusOption=%s]",
                id, statusOption);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public ApiUser getApiUser() {
        return apiUser;
    }

    public void setApiUser(ApiUser apiUser) {
        this.apiUser = apiUser;
    }

    public Feedback getFeedback() {
        return feedback;
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
    }

    public StatusOption getStatusOption() {
        return statusOption;
    }

    public void setStatusOption(StatusOption statusOption) {
        this.statusOption = statusOption;
    }
}
